import { ECronJobType, IntervalHour } from "@/cronjobs/cronjobs.types";
import { User } from "@/entities/user/user.entity";
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
        user: User,
        data: OfflineryNotification["data"],
    ): OfflineryNotification {
        return {
            sound: "default" as const,
            title: this.i18n.t("main.notification.ghostmodeReminder.title", {
                args: {
                    firstName: user.firstName,
                },
                lang: user.preferredLanguage ?? ELanguage.en,
            }),
            body: this.i18n.t("main.notification.ghostmodeReminder.body", {
                lang: user.preferredLanguage ?? ELanguage.en,
            }),
            to: user.pushToken,
            data,
        };
    }

    protected async sendEmail(
        user: User,
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
