import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EEmailVerificationStatus } from "src/types/user.types";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { PendingUser } from "./pending-user/pending-user.entity";

@Injectable()
export class RegistrationService {
    private readonly logger = new Logger(RegistrationService.name);
    readonly VERIFICATION_CODE_EXPIRATION_IN_MIN = 15;

    constructor(
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private readonly mailService: MailerService,
    ) {}

    public async registerPendingUser(email: string): Promise<string> {
        try {
            const existingPendingUser = await this.pendingUserRepo.findOneBy({
                email,
                verificationStatus: EEmailVerificationStatus.VERIFIED,
            });
            const existingVerifiedUser = await this.userRepo.findOneBy({
                email,
            });

            if (existingPendingUser || existingVerifiedUser) {
                throw new Error("Email already exists.");
            }

            let pendingUser = await this.pendingUserRepo.findOneBy({ email });

            if (!pendingUser) {
                pendingUser = new PendingUser();
                pendingUser.email = email;
                pendingUser.verificationStatus =
                    EEmailVerificationStatus.PENDING;
            }

            pendingUser.verificationCodeIssuedAt = new Date();

            let verificationNumber: string = "";
            for (let index = 0; index <= 5; index++) {
                const randomNumber = Math.floor(Math.random() * 9).toString();

                verificationNumber = verificationNumber.concat(randomNumber);
            }

            // Send email before saving as pending user
            await this.sendMail(pendingUser.email, verificationNumber);

            pendingUser.verificationCode = verificationNumber;
            await this.pendingUserRepo.save(pendingUser);

            return pendingUser.email;
        } catch (error) {
            console.error(error);
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
            console.error(error);
            throw error;
        }
    }

    private async sendMail(to: string, verificationCode: string) {
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
