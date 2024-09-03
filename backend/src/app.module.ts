import { BlacklistedRegionModule } from "@/entities/blacklisted-region/blacklisted-region.module";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { RegistrationModule } from "@/entities/registration/registration.module";
import { UserReportModule } from "@/entities/user-report/user-report.module";
import { UserModule } from "@/entities/user/user.module";
import { SeederModule } from "@/seeder/seeder.module";
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
import * as path from "node:path";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
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
        TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
        CacheModule.register({
            isGlobal: true,
        }),
        I18nModule.forRoot({
            fallbackLanguage: ELanguage.en,
            loaderOptions: {
                path: path.join("src", "translations"), // Updated path
                watch: true,
            },
            resolvers: [
                { use: QueryResolver, options: ["lang"] },
                new HeaderResolver(["x-custom-lang"]),
                AcceptLanguageResolver,
            ],
            typesOutputPath: path.join(
                "src",
                "translations",
                "i18n.generated.ts",
            ),
            logging: true,
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
        RegistrationModule,
        SeederModule,
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
