import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './user/user.entity';
import {UserModule} from './user/user.module';
import {ConfigModule} from '@nestjs/config';
import {CacheInterceptor, CacheModule} from '@nestjs/cache-manager';
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core';
import {BlacklistedRegion} from './blacklisted-region/blacklisted-region.entity';
import {BlacklistedRegionModule} from './blacklisted-region/blacklisted-region.module';
import {ThrottlerModule} from '@nestjs/throttler';
import {NotificationModule} from './transient-services/notification/notification.module';
import {UserReportModule} from './user-report/user-report.module';
import {UserReport} from './user-report/user-report.entity';
import {TYPED_ENV} from './utils/env.utils';
import {AuthGuard} from './auth/auth.guard';
import {AuthModule} from './auth/auth.module';
import {Encounter} from './encounter/encounter.entity';
import {EncounterModule} from './encounter/encounter.module';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {RegistrationModule} from './registration/registration.module';
import {PendingUser} from './registration/pending-user/pending-user.entity';
import {MatchingModule} from "./transient-services/matching/matching.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            synchronize: true, // TODO: Remove in prod
            type: 'postgres',
            host: TYPED_ENV.DB_HOST,
            port: parseInt(TYPED_ENV.DB_PORT),
            username: TYPED_ENV.DB_USER,
            password: TYPED_ENV.DB_PASSWORD,
            database: TYPED_ENV.DB_DATABASE,
            entities: [User, BlacklistedRegion, UserReport, Encounter, PendingUser],
        }),
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
            rootPath: join(__dirname, '..', 'uploads/img'),
            serveRoot: '/img',
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
export class AppModule {
}
