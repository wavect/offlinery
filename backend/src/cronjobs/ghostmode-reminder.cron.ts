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

interface GhostModeTarget {
    user: User;
    intervalHour: IntervalHour;
}

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
        const now = new Date();

        // Find who needs to be notified
        const targets = await this.findGhostModeTargets(now);
        // Send the notifications
        await this.sendGhostModeReminders(targets, now);

        this.logger.debug(`All ghostmode reminders sent for all intervals.`);
    }

    public async findGhostModeTargets(
        now: Date = new Date(),
    ): Promise<GhostModeTarget[]> {
        const targets: GhostModeTarget[] = [];
        const chunks = 100;

        for (const intervalHour of DEFAULT_INTERVAL_HOURS) {
            this.logger.debug(
                `Checking users for interval ${intervalHour.hours}h.`,
            );
            const previousInterval = getPreviousInterval(intervalHour);
            let skip = 0;

            while (true) {
                // Calculate the reminder threshold date properly
                const reminderThreshold = new Date(now);
                reminderThreshold.setHours(
                    reminderThreshold.getHours() -
                        (intervalHour.hours - (previousInterval?.hours ?? 0)),
                );

                const users = await this.userRepository
                    .createQueryBuilder("user")
                    .where("user.dateMode = :mode", { mode: EDateMode.GHOST })
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
                    .andWhere(
                        `(user.lastDateModeReminderSent IS NULL${
                            previousInterval
                                ? " OR user.lastDateModeReminderSent <= :reminderThreshold"
                                : ""
                        })`,
                        {
                            reminderThreshold: reminderThreshold,
                        },
                    )
                    .take(chunks)
                    .skip(skip)
                    .getMany();

                if (users.length === 0) break;

                users.forEach((user) => {
                    targets.push({ user, intervalHour });
                });

                skip += chunks;
            }
        }

        return targets;
    }

    public async sendGhostModeReminders(
        targets: GhostModeTarget[],
        now: Date,
    ): Promise<void> {
        const notificationTicketsToSend: OfflineryNotification[] = [];

        await Promise.all(
            targets.map(async ({ user, intervalHour }) => {
                try {
                    // Send email
                    await this.sendEmail(user, intervalHour);

                    // Prepare push notification if possible
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

                    // Update user reminder status
                    await this.userRepository.update(user.id, {
                        lastDateModeReminderSent: now,
                        lastDateModeChange:
                            user.lastDateModeChange ??
                            new Date(now.getTime() - 25 * 60 * 60 * 1000),
                    });
                } catch (error) {
                    this.logger.error(
                        `Failed to process user ${user.id} in cronjob ghostmode-reminder:`,
                        error,
                    );
                }
            }),
        );

        // Send all push notifications
        if (notificationTicketsToSend.length > 0) {
            const tickets =
                await this.notificationService.sendPushNotifications(
                    notificationTicketsToSend,
                );
            this.logger.debug(
                `Sent ${tickets.length} push notifications, status codes: ${JSON.stringify(tickets.map((t) => t.status))}`,
            );
        }
    }
}
