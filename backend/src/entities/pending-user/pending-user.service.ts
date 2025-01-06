import { AuthService } from "@/auth/auth.service";
import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NotificationAccountApprovedDTO } from "@/DTOs/notifications/notification-account-approved";
import {
    RegistrationForVerificationRequestDTO,
    RegistrationForVerificationResponseDTO,
} from "@/DTOs/registration-for-verification.dto";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { MailchimpService } from "@/transient-services/mailchimp/mailchimp.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import {
    EEmailVerificationStatus,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import {
    EMAIL_CODE_EXPIRATION_IN_MS,
    generate6DigitEmailCode,
    RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
} from "@/utils/security.utils";
import { MailerService } from "@nestjs-modules/mailer";
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

@Injectable()
export class PendingUserService {
    private readonly logger = new Logger(PendingUserService.name);

    constructor(
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private readonly mailService: MailerService,
        private readonly i18n: I18nService,
        private authService: AuthService,
        private mailchimpService: MailchimpService,
        private notificationService: NotificationService,
    ) {}

    public async registerPendingUser(
        dto: RegistrationForVerificationRequestDTO,
    ): Promise<RegistrationForVerificationResponseDTO> {
        try {
            const existingVerifiedUser = await this.userRepo.findOneBy({
                email: dto.email,
            });

            if (existingVerifiedUser) {
                throw new ConflictException("Email already exists.");
            }

            let pendingUser = await this.pendingUserRepo.findOneBy({
                email: dto.email,
            });

            if (pendingUser) {
                const registrationJWToken =
                    await this.authService.createRegistrationSession(
                        pendingUser.id,
                    );
                if (
                    pendingUser.verificationStatus ===
                    EEmailVerificationStatus.VERIFIED
                ) {
                    this.logger.debug(
                        `User ${pendingUser.email} already verified, but didn't register yet.`,
                    );
                    return {
                        email: pendingUser.email,
                        timeout: RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
                        codeIssuedAt: pendingUser.verificationCodeIssuedAt,
                        alreadyVerifiedButNotRegistered: true,
                        registrationJWToken,
                    };
                } else {
                    this.logger.debug(
                        `User ${pendingUser.email} not verified, but already has a pending request.`,
                    );
                    // We already issued a verification code in the last xxx seconds.
                    if (
                        Date.now() <
                        new Date(
                            pendingUser.verificationCodeIssuedAt,
                        ).getTime() +
                            RESEND_EMAIL_CODE_TIMEOUT_IN_MS
                    ) {
                        this.logger.debug(
                            `Already issued verification that has not yet expired, returning old data.`,
                        );
                        return {
                            email: pendingUser.email,
                            timeout: RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
                            codeIssuedAt: pendingUser.verificationCodeIssuedAt,
                            alreadyVerifiedButNotRegistered: false,
                            registrationJWToken,
                        };
                    }
                }
            } else {
                pendingUser = new PendingUser();
                pendingUser.email = dto.email;
                pendingUser.verificationStatus =
                    EEmailVerificationStatus.PENDING;

                if (dto.wantsEmailUpdates) {
                    const newsletterSignUpSuccessful =
                        await this.mailchimpService.addMailchimpSubscriber(
                            pendingUser.email,
                        );
                    this.logger.debug(
                        `Tried to sign up user to mailchimp newsletter as checkbox checked. Success: ${newsletterSignUpSuccessful}, email: ${dto.email}`,
                    );
                }
            }

            this.logger.debug(`Issuing new verification code for user.`);
            pendingUser.verificationCodeIssuedAt = new Date();

            const verificationNumber = generate6DigitEmailCode();

            // Send email before saving as pending user
            await this.sendVerificationCodeMail(
                pendingUser.email,
                verificationNumber,
                dto.language,
            );

            pendingUser.verificationCode = verificationNumber;
            await this.pendingUserRepo.save(pendingUser);

            return {
                email: pendingUser.email,
                codeIssuedAt: pendingUser.verificationCodeIssuedAt,
                timeout: RESEND_EMAIL_CODE_TIMEOUT_IN_MS,
                alreadyVerifiedButNotRegistered: false,
                registrationJWToken:
                    await this.authService.createRegistrationSession(
                        pendingUser.id,
                    ),
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

            if (currentTime - issuedTime > EMAIL_CODE_EXPIRATION_IN_MS) {
                throw new ForbiddenException("Verification code has expired.");
            }
            user.verificationStatus = EEmailVerificationStatus.VERIFIED;
            await this.pendingUserRepo.save(user);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async setAcceptedSpecialDataGenderLookingForAt(
        email: string,
        date: Date,
    ) {
        this.logger.debug(
            `User ${email} accepted special data privacy requirement for sexual orientation: ${date}`,
        );
        const pendingUser = await this.pendingUserRepo.findOneByOrFail({
            email: email,
        });

        pendingUser.acceptedSpecialDataGenderLookingForAt = date;
        await this.pendingUserRepo.save(pendingUser);
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
            await this.sendAccountVerificationSuccessfulMail(user);
            if (user.pushToken) {
                /// @dev Also send push notification
                const notificationData: NotificationAccountApprovedDTO = {
                    type: ENotificationType.ACCOUNT_APPROVED,
                    screen: EAppScreens.ACCOUNT_VERIFIED,
                };
                const lang = user.preferredLanguage ?? ELanguage.en;
                await this.notificationService.sendPushNotifications([
                    {
                        sound: "default" as const,
                        title: this.i18n.translate(
                            "main.notification.accountApproved.title",
                            {
                                lang,
                            },
                        ),
                        body: this.i18n.translate(
                            "main.notification.accountApproved.body",
                            {
                                lang,
                            },
                        ),
                        to: user.pushToken,
                        data: notificationData,
                    },
                ]);
            }
        }
        await this.userRepo.save(user);
        this.logger.debug(
            `Account ${email} verification status has been changed to ${newStatus}.`,
        );
    }

    private async sendAccountVerificationSuccessfulMail(user: User) {
        const lang = user.preferredLanguage || ELanguage.en;

        this.logger.debug(
            `Sending new email to ${user.email} as account verification successful in ${lang}.`,
        );
        await this.mailService.sendMail({
            to: user.email,
            subject: await this.i18n.translate(
                "main.email.verification-successful.subject",
                { lang },
            ),
            template: "verification-successful",
            context: {
                firstName: user.firstName,
                t: (key: string, params?: Record<string, any>) =>
                    this.i18n.translate(
                        `main.email.verification-successful.${key}`,
                        { lang, args: { ...(params?.hash ?? params) } },
                    ),
            },
        });
    }

    private async sendVerificationCodeMail(
        to: string,
        verificationCode: string,
        language: ELanguage,
    ) {
        this.logger.debug(
            `Sending new email to ${to} with verificationCode ${verificationCode} in ${language}.`,
        );
        await this.mailService.sendMail({
            to,
            subject: await this.i18n.translate(
                "main.email.email-verification.subject",
                { lang: language },
            ),
            template: "email-verification",
            context: {
                verificationCode,
                t: (key: string, args?: any) =>
                    this.i18n.translate(
                        `main.email.email-verification.${key}`,
                        {
                            lang: language,
                            args,
                        },
                    ),
            },
        });
    }
}
