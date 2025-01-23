import {
    ECronJobType,
    IntervalHour,
    ReceivableUser,
} from "@/cronjobs/cronjobs.types";
import { OfflineryNotification } from "@/types/notification-message.types";
import { ELanguage } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { I18nService } from "nestjs-i18n";

export abstract class BaseCronJob {
    protected constructor(
        protected cronJobType: ECronJobType,
        protected mailService: MailerService,
        protected readonly i18n: I18nService,
    ) {}

    protected buildNotification(
        user: ReceivableUser,
        data: OfflineryNotification["data"],
    ): OfflineryNotification {
        const lang = user.preferredLanguage ?? ELanguage.en;
        return {
            sound: "default" as const,
            title: this.i18n.t(`main.notification.${this.cronJobType}.title`, {
                args: {
                    firstName: user.firstName,
                },
                lang,
            }),
            body: this.i18n.t(`main.notification.${this.cronJobType}.body`, {
                lang,
            }),
            to: user.pushToken,
            data,
        };
    }

    protected async sendEmail(
        user: ReceivableUser,
        intervalHour: IntervalHour,
    ): Promise<void> {
        const lang = user.preferredLanguage ?? ELanguage.en;

        await this.mailService.sendMail({
            to: user.email,
            subject: await this.i18n.translate(
                `main.email.${this.cronJobType}.subject`,
                { lang },
            ),
            template: this.cronJobType,
            context: {
                firstName: user.firstName,
                intervalHour: this.i18n.t(intervalHour.translationKey, {
                    lang,
                }),
                languageId: lang,
                email: user.email,
                t: (key: string, params?: Record<string, any>) =>
                    this.i18n.translate(
                        `main.email.${this.cronJobType}.${key}`,
                        { lang, args: { ...(params?.hash ?? params) } },
                    ),
            },
        });
    }
}
