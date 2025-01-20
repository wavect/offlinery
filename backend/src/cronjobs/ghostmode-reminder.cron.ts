import { BaseCronJob } from "@/cronjobs/base.cron";
import {
    DEFAULT_INTERVAL_HOURS,
    ECronJobType,
    getIntervalDateTime,
    getPreviousInterval,
    IntervalHour,
} from "@/cronjobs/cronjobs.types";
import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { User } from "@/entities/user/user.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import {
    EApproachChoice,
    EDateMode,
    EVerificationStatus,
} from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

@Injectable()
export class GhostModeReminderCronJob extends BaseCronJob {
    private readonly logger = new Logger(GhostModeReminderCronJob.name);

    constructor(
        @InjectRepository(User)
        protected userRepository: Repository<User>,
        protected readonly notificationService: NotificationService,
        protected readonly mailService: MailerService,
        protected readonly i18n: I18nService,
    ) {
        super(ECronJobType.GHOST_MODE_REMINDER, mailService, i18n);
    }

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async checkGhostModeUsers(): Promise<void> {
        this.logger.debug(`Starting checkGhostModeUsers cron job..`);
        const chunks = 100; // Process users in chunks to prevent memory overload
        const now = new Date();

        const notificationTicketsToSend: OfflineryNotification[] = [];

        // Process one interval at a time, from longest to shortest
        for (let i = 0; i < DEFAULT_INTERVAL_HOURS.length; i++) {
            const intervalHour = DEFAULT_INTERVAL_HOURS[i];
            let skip = 0;

            this.logger.debug(
                `Checking users for interval ${intervalHour.hours}h.`,
            );
            const previousInterval: IntervalHour | null =
                getPreviousInterval(intervalHour);

            while (true) {
                const users = await this.userRepository
                    .createQueryBuilder("user")
                    .where("user.dateMode = :mode", { mode: EDateMode.GHOST })
                    /** Only get active users basically: (verified AND not beApproached) OR (beApproached) */
                    .andWhere(
                        "((user.verificationStatus = :verificationStatusVerified AND user.approachChoice <> :beApproached) OR user.approachChoice = :beApproached)",
                        {
                            beApproached: EApproachChoice.BE_APPROACHED,
                            verificationStatusVerified:
                                EVerificationStatus.VERIFIED,
                        },
                    )
                    .andWhere(
                        "((user.lastDateModeChange IS NOT NULL AND user.lastDateModeChange <= :currentInterval) OR " +
                            "(user.lastDateModeChange IS NULL AND user.updated <= :currentInterval))",
                        {
                            currentInterval: getIntervalDateTime(intervalHour),
                        },
                    )
                    // Only get users who haven't been reminded yet or were last reminded before the previous interval
                    .andWhere(
                        `(user.lastDateModeReminderSent IS NULL${previousInterval && " OR user.lastDateModeReminderSent <= :currentInterval"})`,
                        {
                            /**
                             * 24h interval: 24-0 -> now - 24h
                             * 48h interval: 72-24 -> now - 48h
                             * 2 weeks interval: 336-72 -> now - 264h
                             * */
                            currentInterval:
                                now.getTime() -
                                (intervalHour.hours -
                                    (previousInterval?.hours ?? 0)) *
                                    60 *
                                    60 *
                                    1000,
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
                            // TODO: Let users configure this in settings
                            await this.sendEmail(user, intervalHour);
                            if (user.pushToken) {
                                const data: NotificationGhostReminderDTO = {
                                    type: ENotificationType.GHOSTMODE_REMINDER,
                                    screen: EAppScreens.GHOSTMODE_REMINDER,
                                };
                                notificationTicketsToSend.push(
                                    this.buildNotification(user, data),
                                );
                            } else {
                                this.logger.warn(
                                    `Cannot send push notification for user ${user.id} to remind about ghost mode since no pushToken. But should have sent email.`,
                                );
                            }

                            await this.userRepository.update(user.id, {
                                lastDateModeReminderSent: now,
                                lastDateModeChange:
                                    user.lastDateModeChange ??
                                    new Date(
                                        now.getTime() - 25 * 60 * 60 * 1000,
                                    ), // @dev set to 25h prior, to kickstart the flow
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
            this.logger.debug(
                `Ghostmode reminders sent for ${intervalHour.hours}h.`,
            );
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
