import { AuthModule } from "@/auth/auth.module";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TYPED_ENV } from "src/utils/env.utils";
import { PendingUserController } from "./pending-user.controller";
import { PendingUserService } from "./pending-user.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([PendingUser, User]),
        AuthModule,
        MailerModule.forRoot({
            transport: {
                host: TYPED_ENV.EMAIL_HOST,
                auth: {
                    user: TYPED_ENV.EMAIL_USERNAME,
                    pass: TYPED_ENV.EMAIL_PASSWORD,
                },
            },
            defaults: {
                from: '"No Reply" <noreply@offlinery.io>',
            },
            template: {
                dir: join(__dirname, "../../mail/templates"),
                adapter: new HandlebarsAdapter(),
            },
        }),
    ],
    providers: [PendingUserService],
    controllers: [PendingUserController],
    exports: [PendingUserService],
})
export class PendingUserModule {}
