import { ELanguage } from "@/types/user.types";
import { TYPED_ENV } from "@/utils/env.utils";
import { IS_DEV_MODE } from "@/utils/misc.utils";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerModule } from "@nestjs/throttler";
import {
    AcceptLanguageResolver,
    HeaderResolver,
    I18nModule,
    QueryResolver,
} from "nestjs-i18n";
import { join } from "path";

export const i18nLngModule = I18nModule.forRoot({
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
    typesOutputPath: join(__dirname, "translations", "i18n.generated.ts"),
    logging: IS_DEV_MODE,
});

export const mailerModule = MailerModule.forRoot({
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
        dir: join(__dirname, "..", "mail"),
        adapter: new HandlebarsAdapter(),
        options: {
            strict: true,
        },
    },
});

export const staticModule = ServeStaticModule.forRoot({
    rootPath: join(
        __dirname,
        "..", // @dev here one up regardless of environment
        "uploads/img",
    ),
    serveRoot: "/img",
});

export const throttlerModuleOptions = ThrottlerModule.forRoot([
    {
        ttl: 60000,
        limit: 10,
    },
]);

export const cacheModuleOptions = CacheModule.register({
    isGlobal: true,
});

export const configModule = ConfigModule.forRoot({
    isGlobal: true,
    load: [() => TYPED_ENV],
});
