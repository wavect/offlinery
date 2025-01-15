import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { User } from "@/entities/user/user.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EDateMode, ELanguage } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

type IntervalHour = {
    translationKey: string;
    hours: number;
};

@Injectable()
export class GhostModeReminderCronJob {
    private readonly logger = new Logger(GhostModeReminderCronJob.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private notificationService: NotificationService,
        private mailService: MailerService,
        private readonly i18n: I18nService,
    ) {}

    private async sendEmail(
        user: User,
        intervalHour: IntervalHour,
    ): Promise<void> {
        const lang = user.preferredLanguage ?? ELanguage.en;
        await this.mailService.sendMail({
            to: user.email,
            subject: await this.i18n.translate(
                "main.email.ghostmode-reminder.subject",
                { lang },
            ),
            template: "ghostmode-reminder",
            context: {
                firstName: user.firstName,
                intervalHour: this.i18n.t(intervalHour.translationKey, {
                    lang,
                }),
                t: (key: string, params?: Record<string, any>) =>
                    this.i18n.translate(
                        `main.email.ghostmode-reminder.${key}`,
                        { lang, args: { ...(params?.hash ?? params) } },
                    ),
            },
        });
    }

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async checkGhostModeUsers(): Promise<void> {
        this.logger.debug(`Starting checkGhostModeUsers cron job..`);
        const now = new Date();
        const chunks = 100;

        const intervalHours: IntervalHour[] = [
            { hours: 24, translationKey: "main.cron.intervalHours.h24" },
            { hours: 72, translationKey: "main.cron.intervalHours.h72" },
            { hours: 336, translationKey: "main.cron.intervalHours.h336" },
        ];

        const notificationTicketsToSend: OfflineryNotification[] = [];

        // Process one interval at a time, from shortest to longest
        for (let i = 0; i < intervalHours.length; i++) {
            const intervalHour = intervalHours[i];
            const previousInterval = i > 0 ? intervalHours[i - 1].hours : 0;
            let skip = 0;

            this.logger.debug(
                `Checking users for interval ${intervalHour.hours}h.`,
            );

            while (true) {
                const users = await this.userRepository
                    .createQueryBuilder("user")
                    .where("user.dateMode = :mode", { mode: EDateMode.GHOST })
                    .andWhere("user.lastDateModeChange <= :currentInterval", {
                        currentInterval: new Date(
                            now.getTime() - intervalHour.hours * 60 * 60 * 1000,
                        ),
                    })
                    // Only get users who haven't been reminded yet or were last reminded before the previous interval
                    .andWhere(
                        "(user.lastDateModeReminderSent IS NULL OR user.lastDateModeReminderSent <= :previousInterval)",
                        {
                            previousInterval: new Date(
                                now.getTime() -
                                    previousInterval * 60 * 60 * 1000,
                            ),
                        },
                    )
                    .take(chunks)
                    .skip(skip)
                    .getMany();

                if (users.length === 0) break;

                this.logger.debug(
                    `Found ${users.length} users to remind for interval ${intervalHour.hours}h.`,
                );

                await Promise.all(
                    users.map(async (user) => {
                        try {
                            await this.sendEmail(user, intervalHour);
                            if (user.pushToken) {
                                const data: NotificationGhostReminderDTO = {
                                    type: ENotificationType.GHOSTMODE_REMINDER,
                                    screen: EAppScreens.GHOSTMODE_REMINDER,
                                };
                                notificationTicketsToSend.push({
                                    sound: "default" as const,
                                    title: this.i18n.t(
                                        "main.notification.ghostmodeReminder.title",
                                        {
                                            args: {
                                                firstName: user.firstName,
                                            },
                                            lang:
                                                user.preferredLanguage ??
                                                ELanguage.en,
                                        },
                                    ),
                                    body: this.i18n.t(
                                        "main.notification.ghostmodeReminder.body",
                                        {
                                            lang:
                                                user.preferredLanguage ??
                                                ELanguage.en,
                                        },
                                    ),
                                    to: user.pushToken,
                                    data,
                                });
                            }

                            await this.userRepository.update(user.id, {
                                lastDateModeReminderSent: now,
                            });
                        } catch (error) {
                            this.logger.error(
                                `Failed to process user ${user.id} in cronjob ghostmode-reminder:`,
                                error,
                            );
                        }
                    }),
                );

                skip += chunks;
            }
        }

        const tickets = await this.notificationService.sendPushNotifications(
            notificationTicketsToSend,
        );
        this.logger.debug(
            `Sent ${tickets.length} push notifications, status codes: ${JSON.stringify(tickets.map((t) => t.status))}`,
        );
        this.logger.debug(`All ghostmode reminders sent for all intervals.`);
    }
}
