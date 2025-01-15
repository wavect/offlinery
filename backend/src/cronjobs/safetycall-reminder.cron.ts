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
        super(ECronJobType.SAFETYCALL_REMINDER, mailService, i18n);
    }

    @Cron(CronExpression.EVERY_DAY_AT_7PM)
    async checkSafetyCallVerificationPending(): Promise<void> {
        this.logger.debug(`Starting verification reminder cron job..`);
        const now = new Date();

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
                    `${usersToRemind.length} users have no scheduled calls and will receive reminders.`,
                );

                // Process reminders in parallel
                await Promise.all(
                    usersToRemind.map((user) =>
                        this.processUserReminder(user, now, currentInterval),
                    ),
                );

                skip += this.BATCH_SIZE;
            }
        }
        this.logger.debug(`Safety call verification reminder job completed.`);
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
