import { RegistrationForVerificationResponseDTO } from "@/DTOs/registration-for-verification.dto";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import {
    EEmailVerificationStatus,
    EVerificationStatus,
} from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class RegistrationService {
    private readonly logger = new Logger(RegistrationService.name);
    readonly VERIFICATION_CODE_EXPIRATION_IN_MIN = 15;
    readonly RESEND_VERIFICATION_CODE_TIMEOUT_IN_MS = 120 * 1000;

    constructor(
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private readonly mailService: MailerService,
    ) {}

    public async registerPendingUser(
        email: string,
    ): Promise<RegistrationForVerificationResponseDTO> {
        try {
            const existingVerifiedUser = await this.userRepo.findOneBy({
                email,
            });

            if (existingVerifiedUser) {
                throw new ConflictException("Email already exists.");
            }

            let pendingUser = await this.pendingUserRepo.findOneBy({ email });

            if (
                pendingUser &&
                pendingUser.verificationStatus ===
                    EEmailVerificationStatus.VERIFIED
            ) {
                this.logger.debug(
                    `User ${pendingUser.email} already verified, but didn't register yet.`,
                );
                return {
                    email: pendingUser.email,
                    timeout: this.RESEND_VERIFICATION_CODE_TIMEOUT_IN_MS,
                    verificationCodeIssuedAt:
                        pendingUser.verificationCodeIssuedAt,
                    alreadyVerifiedButNotRegistered: true,
                };
            } else {
                pendingUser = new PendingUser();
                pendingUser.email = email;
                pendingUser.verificationStatus =
                    EEmailVerificationStatus.PENDING;
            }

            // We already issued a verification code in the last xxx seconds.
            if (
                Date.now() <
                new Date(pendingUser.verificationCodeIssuedAt).getTime() +
                    this.RESEND_VERIFICATION_CODE_TIMEOUT_IN_MS
            ) {
                return {
                    email: pendingUser.email,
                    timeout: this.RESEND_VERIFICATION_CODE_TIMEOUT_IN_MS,
                    verificationCodeIssuedAt:
                        pendingUser.verificationCodeIssuedAt,
                    alreadyVerifiedButNotRegistered: false,
                };
            }

            pendingUser.verificationCodeIssuedAt = new Date();

            let verificationNumber: string = "";
            for (let index = 0; index <= 5; index++) {
                const randomNumber = Math.floor(Math.random() * 9).toString();

                verificationNumber = verificationNumber.concat(randomNumber);
            }

            // Send email before saving as pending user
            await this.sendVerificationCodeMail(
                pendingUser.email,
                verificationNumber,
            );

            pendingUser.verificationCode = verificationNumber;
            await this.pendingUserRepo.save(pendingUser);

            return {
                email: pendingUser.email,
                verificationCodeIssuedAt: pendingUser.verificationCodeIssuedAt,
                timeout: this.RESEND_VERIFICATION_CODE_TIMEOUT_IN_MS,
                alreadyVerifiedButNotRegistered: false,
            };
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async verifyEmail(email: string, code: string): Promise<void> {
        try {
            const user = await this.pendingUserRepo.findOneByOrFail({
                email: email,
                verificationCode: code,
            });

            const currentTime = new Date().getTime();
            const issuedTime = user.verificationCodeIssuedAt.getTime();

            const expirationTimeInMs =
                this.VERIFICATION_CODE_EXPIRATION_IN_MIN * 60 * 1000;

            if (currentTime - issuedTime > expirationTimeInMs) {
                throw new Error("Verification code has expired.");
            }

            user.verificationStatus = EEmailVerificationStatus.VERIFIED;
            await this.pendingUserRepo.save(user);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async changeVerificationStatus(
        email: string,
        newStatus: EVerificationStatus,
    ) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new NotFoundException(
                `User with email ${email} does not exist!`,
            );
        }
        if (!user.isActive) {
            throw new BadRequestException("Account is inactive!");
        }
        if (user.verificationStatus === newStatus) {
            throw new BadRequestException("No change in verificationStatus!");
        }
        user.verificationStatus = newStatus;
        if (newStatus === EVerificationStatus.VERIFIED) {
            await this.sendAccountVerificationSuccessfulMail(email);
        }
        await this.userRepo.save(user);
        this.logger.debug(
            `Account ${email} verification status has been changed to ${newStatus}.`,
        );
    }

    private async sendAccountVerificationSuccessfulMail(to: string) {
        this.logger.debug(
            `Sending new email to ${to} as account verification successful`,
        );
        await this.mailService.sendMail({
            to,
            subject: "Offlinery: Your account has been verified",
            template: "../../mail/templates/verification-successful.hbs",
            context: {
                name: to,
            },
        });
    }

    private async sendVerificationCodeMail(
        to: string,
        verificationCode: string,
    ) {
        this.logger.debug(
            `Sending new email to ${to} with verificationCode ${verificationCode}`,
        );
        await this.mailService.sendMail({
            to,
            subject: "Welcome to Offlinery! Confirm your Email",
            template: "../../mail/templates/email-verification.hbs",
            context: {
                name: to,
                verificationCode,
            },
        });
    }
}
