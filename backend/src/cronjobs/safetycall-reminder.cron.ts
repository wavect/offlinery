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

interface ReminderResult {
    usersToUpdate: { id: string; lastReminderSent: Date }[];
    emailsToSend: { user: User; interval: IntervalHour }[];
}

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
        super(ECronJobType.SAFETY_CALL_REMINDER, mailService, i18n);
    }

    @Cron(CronExpression.EVERY_DAY_AT_7PM)
    async checkSafetyCallVerificationPending(): Promise<void> {
        this.logger.debug(`Starting verification reminder cron job..`);
        const reminderResults = await this.collectUsersForReminders();
        await this.sendReminders(reminderResults);
    }

    public async collectUsersForReminders(): Promise<ReminderResult> {
        const now = new Date();
        const result: ReminderResult = {
            usersToUpdate: [],
            emailsToSend: [],
        };

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
                const usersToRemind = users.filter((user) =>
                    emailsWithoutCalls.has(user.email.toLowerCase()),
                );

                this.logger.debug(
                    `${usersToRemind.length} users have no scheduled calls and will receive reminders: ${usersToRemind.map((u) => u.email)}`,
                );

                // Collect users for updates and emails
                usersToRemind.forEach((user) => {
                    result.usersToUpdate.push({
                        id: user.id,
                        lastReminderSent: now,
                    });
                    result.emailsToSend.push({
                        user,
                        interval: currentInterval,
                    });
                });

                skip += this.BATCH_SIZE;
            }
        }

        this.logger.debug(`Collection of users for reminders completed.`);
        return result;
    }

    private async sendReminders(
        reminderResults: ReminderResult,
    ): Promise<void> {
        try {
            // Update all users in bulk
            if (reminderResults.usersToUpdate.length > 0) {
                await Promise.all(
                    reminderResults.usersToUpdate.map((update) =>
                        this.userRepository.update(update.id, {
                            lastSafetyCallVerificationReminderSent:
                                update.lastReminderSent,
                        }),
                    ),
                );
            }

            // Send all emails
            if (reminderResults.emailsToSend.length > 0) {
                await Promise.all(
                    reminderResults.emailsToSend.map(({ user, interval }) =>
                        this.sendEmail(user, interval).catch((error) => {
                            this.logger.error(
                                `Failed to send email to user ${user.id}: ${error.message}`,
                            );
                        }),
                    ),
                );
            }

            this.logger.debug(
                `Successfully processed ${reminderResults.usersToUpdate.length} reminders.`,
            );
        } catch (error) {
            this.logger.error(
                `Error processing reminders batch: ${error.message}`,
            );
            throw error;
        }
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
}
