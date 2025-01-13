import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
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
    providers: [GhostModeReminderCronJob],
    exports: [GhostModeReminderCronJob],
})
export class CronJobsModule {}
