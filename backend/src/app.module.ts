import { ApiUserModule } from "@/entities/api-user/api-user.module";
import { BlacklistedRegionModule } from "@/entities/blacklisted-region/blacklisted-region.module";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { MapModule } from "@/entities/map/map.module";
import { PendingUserModule } from "@/entities/pending-user/pending-user.module";
import { UserReportModule } from "@/entities/user-report/user-report.module";
import { UserModule } from "@/entities/user/user.module";
import { SeederModule } from "@/seeder/seeder.module";
import { IS_DEV_MODE } from "@/utils/misc.utils";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
    AcceptLanguageResolver,
    HeaderResolver,
    I18nModule,
    QueryResolver,
} from "nestjs-i18n";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { UserFeedbackModule } from "./entities/user-feedback/user-feedback.module";
import { MatchingModule } from "./transient-services/matching/matching.module";
import { NotificationModule } from "./transient-services/notification/notification.module";
import { typeOrmAsyncConfig } from "./typeorm.config";
import { ELanguage } from "./types/user.types";
import { TYPED_ENV } from "./utils/env.utils";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [() => TYPED_ENV],
        }),
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
                dir: join(__dirname, "mail"),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        CacheModule.register({
            isGlobal: true,
        }),
        I18nModule.forRoot({
            fallbackLanguage: ELanguage.en,
            loaderOptions: {
                path: join(__dirname, "translations"), // Updated path
                watch: IS_DEV_MODE,
            },
            resolvers: [
                { use: QueryResolver, options: ["lang"] },
                new HeaderResolver(["x-custom-lang"]),
                AcceptLanguageResolver,
            ],
            typesOutputPath: join(
                __dirname,
                "translations",
                "i18n.generated.ts",
            ),
            logging: IS_DEV_MODE,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "uploads/img"),
            serveRoot: "/img",
        }),
        UserModule,
        MatchingModule,
        NotificationModule,
        BlacklistedRegionModule,
        UserReportModule,
        AuthModule,
        EncounterModule,
        PendingUserModule,
        SeederModule,
        MapModule,
        ApiUserModule,
        UserFeedbackModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
