import { BaseCronJob } from "@/cronjobs/base.cron";
import { CalendlyService } from "@/cronjobs/calendly.service";
import {
    DEFAULT_INTERVAL_HOURS,
    ECronJobType,
    IntervalHour,
} from "@/cronjobs/cronjobs.types";
import { User } from "@/entities/user/user.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EApproachChoice, EVerificationStatus } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

@Injectable()
export class SafetyCallReminderCronJob extends BaseCronJob {
    private readonly logger = new Logger(SafetyCallReminderCronJob.name);
    private readonly BATCH_SIZE = 100;

    constructor(
        @InjectRepository(User)
        protected userRepository: Repository<User>,
        protected readonly notificationService: NotificationService,
        protected readonly mailService: MailerService,
        protected readonly i18n: I18nService,
        protected readonly calendlyService: CalendlyService,
    ) {
        super(
            notificationService,
            ECronJobType.SAFETYCALL_REMINDER,
            mailService,
            i18n,
        );
    }

    @Cron(CronExpression.EVERY_DAY_AT_7PM)
    async executeSafetyCallReminderJob(): Promise<void> {
        this.logger.debug("Starting verification reminder cron job..");
        const usersToRemind = await this.findUsersNeedingReminders();
        await this.processUsersReminders(usersToRemind);
        this.logger.debug("Safety call verification reminder job completed.");
    }

    // This method contains the testable logic
    async findUsersNeedingReminders(): Promise<User[]> {
        const now = new Date();
        const usersToRemind: User[] = [];

        // Process one interval at a time, from longest to shortest
        for (let i = 0; i < DEFAULT_INTERVAL_HOURS.length; i++) {
            const currentInterval = DEFAULT_INTERVAL_HOURS[i];
            const nextInterval = DEFAULT_INTERVAL_HOURS[i + 1]?.hours ?? 0;
            let skip = 0;

            this.logger.debug(
                `Checking users for interval ${currentInterval.hours}h.`,
            );

            while (true) {
                // Get batch of users that need to be checked
                const users = await this.getUserBatch(
                    now,
                    currentInterval.hours,
                    nextInterval,
                    skip,
                );

                if (users.length === 0) break;

                this.logger.debug(
                    `Found ${users.length} potential users to remind for interval ${currentInterval.hours}h.`,
                );

                // Extract emails and check Calendly in bulk
                const emails = users.map((user) => user.email);
                const emailsWithoutCalls =
                    await this.calendlyService.getEmailsOfUsersWithoutUpcomingSafetyCall(
                        emails,
                    );

                // Filter users who need reminders
                const batchUsersToRemind = users.filter((user) =>
                    emailsWithoutCalls.has(user.email.toLowerCase()),
                );

                this.logger.debug(
                    `${batchUsersToRemind.length} users have no scheduled calls and will receive reminders.`,
                );

                usersToRemind.push(...batchUsersToRemind);
                skip += this.BATCH_SIZE;
            }
        }

        return usersToRemind;
    }

    // This method handles the execution
    private async processUsersReminders(users: User[]): Promise<void> {
        const now = new Date();
        await Promise.all(
            users.map(async (user) => {
                const interval = this.findIntervalForUser(user, now);
                if (interval) {
                    await this.processUserReminder(user, now, interval);
                }
            }),
        );
    }

    private findIntervalForUser(user: User, now: Date): IntervalHour | null {
        const userCreatedTime = user.created.getTime();
        const currentTime = now.getTime();

        for (let i = 0; i < DEFAULT_INTERVAL_HOURS.length; i++) {
            const currentInterval = DEFAULT_INTERVAL_HOURS[i];
            const nextInterval = DEFAULT_INTERVAL_HOURS[i + 1]?.hours ?? 0;

            const currentIntervalTime =
                currentTime - currentInterval.hours * 60 * 60 * 1000;
            const nextIntervalTime =
                currentTime - nextInterval * 60 * 60 * 1000;

            if (
                userCreatedTime <= currentIntervalTime &&
                (nextInterval === 0 || userCreatedTime > nextIntervalTime)
            ) {
                return currentInterval;
            }
        }
        return null;
    }

    private async getUserBatch(
        now: Date,
        currentIntervalHours: number,
        nextIntervalHours: number,
        skip: number,
    ): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder("user")
            .where("user.verificationStatus = :status", {
                status: EVerificationStatus.PENDING,
            })
            .andWhere("(user.approachChoice != :approach)", {
                approach: EApproachChoice.BE_APPROACHED,
            })
            .andWhere("(user.created <= :currentInterval)", {
                currentInterval: new Date(
                    now.getTime() - currentIntervalHours * 60 * 60 * 1000,
                ),
            })
            .andWhere(
                nextIntervalHours ? "(user.created > :nextInterval)" : "(1=1)",
                nextIntervalHours
                    ? {
                          nextInterval: new Date(
                              now.getTime() -
                                  nextIntervalHours * 60 * 60 * 1000,
                          ),
                      }
                    : {},
            )
            .andWhere(
                "(user.lastSafetyCallVerificationReminderSent IS NULL OR user.lastSafetyCallVerificationReminderSent <= :previousInterval)",
                {
                    previousInterval: new Date(
                        now.getTime() - currentIntervalHours * 60 * 60 * 1000,
                    ),
                },
            )
            .take(this.BATCH_SIZE)
            .skip(skip)
            .getMany();
    }

    private async processUserReminder(
        user: User,
        now: Date,
        currentInterval: IntervalHour,
    ): Promise<void> {
        try {
            await this.sendEmail(user, currentInterval);
            await this.userRepository.update(user.id, {
                lastSafetyCallVerificationReminderSent: now,
            });
        } catch (error) {
            this.logger.error(
                `Failed to process user ${user.id} in verification reminder:`,
                error,
            );
        }
    }
}
