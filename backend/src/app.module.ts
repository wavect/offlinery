import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { BlacklistedRegionModule } from "./blacklisted-region/blacklisted-region.module";
import { EncounterModule } from "./encounter/encounter.module";
import { RegistrationModule } from "./registration/registration.module";
import { MatchingModule } from "./transient-services/matching/matching.module";
import { NotificationModule } from "./transient-services/notification/notification.module";
import { typeOrmAsyncConfig } from "./typeorm.config";
import { UserReportModule } from "./user-report/user-report.module";
import { UserModule } from "./user/user.module";
import { TYPED_ENV } from "./utils/env.utils";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [() => TYPED_ENV],
        }),
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        // @dev https://docs.nestjs.com/techniques/caching
        CacheModule.register({
            isGlobal: true,
        }),
        /* right now directly saved in UserService
            MulterModule.register({
               dest: './uploads'
            }),*/
        // @dev https://docs.nestjs.com/security/rate-limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]),
        ServeStaticModule.forRoot({
            // serve images
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
        RegistrationModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
        {
            // @dev By default all routes should be private, except the ones we declare as public (security)
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
