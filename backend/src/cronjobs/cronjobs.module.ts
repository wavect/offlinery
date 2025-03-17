import { CalendlyService } from "@/cronjobs/calendly.service";
import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
import { SafetyCallReminderCronJob } from "@/cronjobs/safetycall-reminder.cron";
import { User } from "@/entities/user/user.entity";
import { NotificationModule } from "@/transient-services/notification/notification.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([User]),
        NotificationModule,
        MailerModule,
    ],
    providers: [
        GhostModeReminderCronJob,
        SafetyCallReminderCronJob,
        CalendlyService,
    ],
    exports: [GhostModeReminderCronJob, SafetyCallReminderCronJob],
})
export class CronJobsModule {}
