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

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.MYSQL_HOST ?? 'localhost',
            port: parseInt(process.env.MYSQL_PORT ?? '3306'),
            username: process.env.MYSQL_USER ?? 'root',
            password: process.env.MYSQL_PASSWORD ?? 'root',
            database: process.env.MYSQL_DATABASE ?? 'test',
            entities: [User, BlacklistedRegion],
        }),
        // @dev https://docs.nestjs.com/techniques/caching
        CacheModule.register(),
        // @dev https://docs.nestjs.com/security/rate-limiting
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 10,
        }]),
        UserModule, BlacklistedRegionModule, NotificationModule,
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
