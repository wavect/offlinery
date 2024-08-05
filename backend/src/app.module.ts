import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./user/user.entity";
import {UserController} from './user/user.controller';
import {UserModule} from "./user/user.module";
import {ConfigModule} from "@nestjs/config";
import {CacheInterceptor, CacheModule} from "@nestjs/cache-manager";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {BlacklistedRegion} from "./blacklisted-region/blacklisted-region.entity";
import {BlacklistedRegionController} from "./blacklisted-region/blacklisted-region.controller";
import {BlacklistedRegionModule} from "./blacklisted-region/blacklisted-region.module";
import {ThrottlerModule} from "@nestjs/throttler";
import {NotificationModule} from "./transient-services/notification/notification.module";
import {UserReportModule} from "./user-report/user-report.module";
import {UserReport} from "./user-report/user-report.entity";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST ?? 'localhost',
            port: parseInt(process.env.DB_PORT ?? '5432'),
            username: process.env.DB_USER ?? 'root',
            password: process.env.DB_PASSWORD ?? 'root',
            database: process.env.DB_DATABASE ?? 'test',
            entities: [User, BlacklistedRegion, UserReport],
        }),
        // @dev https://docs.nestjs.com/techniques/caching
        CacheModule.register(),
        // @dev https://docs.nestjs.com/security/rate-limiting
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 10,
        }]),
        UserModule, BlacklistedRegionModule, NotificationModule, UserReportModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CacheInterceptor,
        },
    ],
})
export class AppModule {
}
