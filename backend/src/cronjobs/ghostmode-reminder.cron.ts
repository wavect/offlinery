import { BaseCronJob } from "@/cronjobs/base.cron";
import {
    DEFAULT_INTERVAL_HOURS,
    ECronJobType,
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
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

@Injectable()
export class GhostModeReminderCronJob extends BaseCronJob {
    private readonly logger = new Logger(GhostModeReminderCronJob.name);
    private readonly BATCH_SIZE = 100;

    constructor(
        @InjectRepository(User)
        protected userRepository: Repository<User>,
        protected readonly notificationService: NotificationService,
        protected readonly mailService: MailerService,
        protected readonly i18n: I18nService,
    ) {
        super(
            notificationService,
            ECronJobType.GHOST_MODE_REMINDER,
            mailService,
            i18n,
        );
    }

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async executeGhostModeUsers() {
        this.logger.debug("Starting ghost mode reminder cron job..");
        const usersToRemind = await this.findUsersNeedingGhostModeReminders();
        const notifications =
            await this.processGhostModeReminders(usersToRemind);
        if (notifications?.length) {
            await this.sendPushNotification(notifications);
        }
        this.logger.debug("Ghost mode reminder job completed.");
    }

    async findUsersNeedingGhostModeReminders(): Promise<User[]> {
        const now = new Date();
        const usersToRemind: User[] = [];

        for (let i = 0; i < DEFAULT_INTERVAL_HOURS.length; i++) {
            const intervalHour = DEFAULT_INTERVAL_HOURS[i];
            const previousInterval =
                i > 0 ? DEFAULT_INTERVAL_HOURS[i - 1].hours : 0;
            let skip = 0;

            this.logger.debug(
                `Checking users for interval ${intervalHour.hours}h.`,
            );

            while (true) {
                const users = await this.getUserBatch(
                    now,
                    intervalHour,
                    previousInterval,
                    skip,
                );
                if (users.length === 0) break;

                this.logger.debug(
                    `Found ${users.length} users to remind for interval ${intervalHour.hours}h.`,
                );

                usersToRemind.push(...users);
                skip += this.BATCH_SIZE;
            }
        }

        return usersToRemind;
    }

    // Execution logic
    async processGhostModeReminders(
        users: User[],
    ): Promise<OfflineryNotification[]> {
        const now = new Date();
        const notificationTicketsToSend: OfflineryNotification[] = [];

        await Promise.all(
            users.map(async (user) => {
                try {
                    const interval = this.findIntervalForUser(user, now);
                    if (!interval) return;

                    await this.sendEmail(user, interval);

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
                                now.getTime() - interval.hours * 60 * 60 * 1000,
                            ),
                    });
                } catch (error) {
                    this.logger.error(
                        `Failed to process user ${user.id} in cronjob ghostmode-reminder:`,
                        error,
                    );
                }
            }),
        );

        return notificationTicketsToSend;
    }

    findIntervalForUser(
        user: User,
        now: Date,
    ): (typeof DEFAULT_INTERVAL_HOURS)[0] | null {
        const lastChangeTime = (
            user.lastDateModeChange ?? user.updated
        ).getTime();
        const currentTime = now.getTime();

        for (let i = 0; i < DEFAULT_INTERVAL_HOURS.length; i++) {
            const currentInterval = DEFAULT_INTERVAL_HOURS[i];
            const nextInterval = DEFAULT_INTERVAL_HOURS[i + 1]?.hours ?? 0;

            const currentIntervalTime =
                currentTime - currentInterval.hours * 60 * 60 * 1000;
            const nextIntervalTime =
                currentTime - nextInterval * 60 * 60 * 1000;

            if (
                lastChangeTime <= currentIntervalTime &&
                (nextInterval === 0 || lastChangeTime > nextIntervalTime)
            ) {
                return currentInterval;
            }
        }
        return null;
    }

    async getUserBatch(
        now: Date,
        intervalHour: (typeof DEFAULT_INTERVAL_HOURS)[0],
        previousInterval: number,
        skip: number,
    ): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder("user")
            .where("user.dateMode = :mode", { mode: EDateMode.GHOST })
            .andWhere(
                "((user.lastDateModeChange IS NOT NULL AND user.lastDateModeChange <= :currentInterval) OR " +
                    "(user.lastDateModeChange IS NULL AND user.updated <= :currentInterval))",
                {
                    currentInterval: new Date(
                        now.getTime() - intervalHour.hours * 60 * 60 * 1000,
                    ),
                },
            )
            .andWhere(
                "(user.lastDateModeReminderSent IS NULL OR user.lastDateModeReminderSent <= :previousInterval)",
                {
                    previousInterval: new Date(
                        now.getTime() -
                            (intervalHour.hours - (previousInterval ? 12 : 0)) *
                                60 *
                                60 *
                                1000,
                    ),
                },
            )
            .take(this.BATCH_SIZE)
            .skip(skip)
            .getMany();
    }
}
