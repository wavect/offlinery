import { BaseCronJob } from "@/cronjobs/base.cron";
import {
    DEFAULT_INTERVAL_HOURS,
    ECronJobType,
    GhostModeTarget,
    goBackInTimeFor,
    IntervalHour,
    OfflineUserSince,
    TimeSpan,
} from "@/cronjobs/cronjobs.types";
import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { User } from "@/entities/user/user.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EDateMode } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { differenceInHours } from "date-fns";
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
        const usersToNotify = await this.findOfflineUsers();
        const ghostModeAdapted = this.ghostModeAdapter(usersToNotify);
        await this.sendGhostModeReminders(ghostModeAdapted);
        this.logger.debug(`All Ghostmode reminders sent for all intervals.`);
    }

    public async findOfflineUsers(): Promise<OfflineUserSince[]> {
        const users = await this.userRepository
            .createQueryBuilder("user")
            .where("user.dateMode = :mode", { mode: EDateMode.GHOST })
            .andWhere("user.lastDateModeChange < :dayAgo", {
                dayAgo: goBackInTimeFor(24, "hours"),
            })
            .andWhere(
                "(user.lastDateModeReminderSent IS NULL OR " +
                    "CASE " +
                    "WHEN user.lastDateModeChange < :twoWeeksAgo THEN user.lastDateModeReminderSent < :twoWeeksMinTime " +
                    "WHEN user.lastDateModeChange < :threeDaysAgo THEN user.lastDateModeReminderSent < :threeDaysMinTime " +
                    "ELSE user.lastDateModeReminderSent < :oneDayMinTime " +
                    "END)",
                {
                    twoWeeksAgo: goBackInTimeFor(336, "hours"),
                    threeDaysAgo: goBackInTimeFor(72, "hours"),
                    twoWeeksMinTime: goBackInTimeFor(336 - 72, "hours"),
                    threeDaysMinTime: goBackInTimeFor(72 - 24, "hours"),
                    oneDayMinTime: goBackInTimeFor(24, "hours"),
                },
            )
            .getMany();

        await Promise.all(
            users.map((user) =>
                this.userRepository.update(
                    { id: user.id },
                    { lastDateModeReminderSent: new Date() },
                ),
            ),
        );

        return users.map((user) => ({
            user: user,
            type: this.determineOfflineType(user.lastDateModeChange),
        }));
    }

    private determineOfflineType(lastDateModeChange: Date): TimeSpan {
        const hoursOffline = differenceInHours(new Date(), lastDateModeChange);
        if (hoursOffline >= 336) return TimeSpan.TWO_WEEKS;
        if (hoursOffline >= 72) return TimeSpan.THREE_DAYS;
        return TimeSpan.ONE_DAY;
    }

    private ghostModeAdapter(input: OfflineUserSince[]): Set<GhostModeTarget> {
        const typeToIntervalMap = new Map<
            OfflineUserSince["type"],
            IntervalHour
        >([
            [TimeSpan.ONE_DAY, DEFAULT_INTERVAL_HOURS[0]],
            [TimeSpan.THREE_DAYS, DEFAULT_INTERVAL_HOURS[1]],
            [TimeSpan.TWO_WEEKS, DEFAULT_INTERVAL_HOURS[2]],
        ]);

        return new Set(
            input.map((offlineUser) => ({
                user: offlineUser.user,
                intervalHour: typeToIntervalMap.get(offlineUser.type)!,
            })),
        );
    }

    public async sendGhostModeReminders(
        targets: Set<GhostModeTarget>,
    ): Promise<void> {
        const notificationTicketsToSend: OfflineryNotification[] = [];

        await Promise.all(
            Array.from(targets).map(async ({ user, intervalHour }) => {
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
