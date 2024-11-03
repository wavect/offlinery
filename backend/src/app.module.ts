import {
    cacheModuleOptions,
    configModule,
    i18nLngModule,
    mailerModule,
    staticModule,
    throttlerModuleOptions,
} from "@/app.module.configuration";
import { ApiUserModule } from "@/entities/api-user/api-user.module";
import { BlacklistedRegionModule } from "@/entities/blacklisted-region/blacklisted-region.module";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { MapModule } from "@/entities/map/map.module";
import { PendingUserModule } from "@/entities/pending-user/pending-user.module";
import { UserReportModule } from "@/entities/user-report/user-report.module";
import { UserModule } from "@/entities/user/user.module";
import { SeederModule } from "@/seeder/seeder.module";
import {
    InfluxLogger,
    PROVIDER_TOKEN_LOGGER,
} from "@/transient-services/logging/influx-db.logger";
import { MailchimpModule } from "@/transient-services/mailchimp/mailchimp.module";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { UserFeedbackModule } from "./entities/user-feedback/user-feedback.module";
import { MatchingModule } from "./transient-services/matching/matching.module";
import { NotificationModule } from "./transient-services/notification/notification.module";
import { typeOrmAsyncConfig } from "./typeorm.config";

@Module({
    imports: [
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        configModule,
        mailerModule,
        i18nLngModule,
        staticModule,
        throttlerModuleOptions,
        cacheModuleOptions,
        UserModule,
        MatchingModule,
        NotificationModule,
        MailchimpModule,
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
        {
            provide: PROVIDER_TOKEN_LOGGER,
            useClass: InfluxLogger,
        },
    ],
    exports: [PROVIDER_TOKEN_LOGGER],
})
export class AppModule {}
