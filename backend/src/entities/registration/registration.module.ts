import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { PendingUserService } from "@/entities/pending-user/pending-user.service";
import { User } from "@/entities/user/user.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TYPED_ENV } from "src/utils/env.utils";
import { RegistrationController } from "./registration.controller";
import { RegistrationService } from "./registration.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([PendingUser, User]),
        MailerModule.forRoot({
            transport: {
                host: TYPED_ENV.EMAIL_HOST,
                auth: {
                    user: TYPED_ENV.EMAIL_USERNAME,
                    pass: TYPED_ENV.EMAIL_PASSWORD,
                },
            },
            defaults: {
                from: '"No Reply" <noreply@offlinery.com>',
            },
            template: {
                dir: join(__dirname, "templates"),
                adapter: new HandlebarsAdapter(),
            },
        }),
    ],
    providers: [RegistrationService, PendingUserService],
    controllers: [RegistrationController],
    exports: [RegistrationService, PendingUserService],
})
export class RegistrationModule {}
