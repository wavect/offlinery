import { BaseNotificationADTO } from "@/DTOs/abstract/base-notification.adto";
import { EmailCodeResponseADTO } from "@/DTOs/abstract/email-code-response.adto";
import { NotificationAccountApprovedDTO } from "@/DTOs/notifications/notification-account-approved";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { NotificationNewEventDTO } from "@/DTOs/notifications/notification-new-event.dto";
import { DefaultApiUserSeeder } from "@/seeder/default-admin-api-user.seeder";
import { DefaultUserSeeder } from "@/seeder/default-user.seeder";
import { RandomUsersSeeder } from "@/seeder/random-users-seeder.service";
import { Create10RealTestPeopleEncounters } from "@/seeder/specific-encounter-seeder.service";
import { InfluxLogger } from "@/transient-services/logging/influx-db.logger";
import { API_VERSION, BE_ENDPOINT } from "@/utils/misc.utils";
import { INestApplication, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import helmet from "helmet";
import * as path from "path";
import { join } from "path";
import * as process from "process";
import { AppModule } from "./app.module";
import { NotificationNavigateUserDTO } from "./DTOs/notifications/notification-navigate-user.dto";
import { TYPED_ENV, validateEnv } from "./utils/env.utils";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
        logger: new InfluxLogger(),
    });

    const userSeederService = app.get(DefaultUserSeeder);
    const apiUserSeederService = app.get(DefaultApiUserSeeder);

    setupSwagger(app);
    setupTypedEnvs();

    // @dev https://docs.nestjs.com/techniques/versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Ensure logs are written on application shutdown
    app.enableShutdownHooks();

    // security base line
    app.use(helmet());

    // @dev Allow views to be rendered too (e.g. forms), views need to be outside src
    const viewsDir = join(__dirname, "..", "views");
    app.setBaseViewsDir(viewsDir);
    app.setViewEngine("hbs");
    console.log("Views directory:", viewsDir);

    await userSeederService.seedDefaultUsers();
    await apiUserSeederService.seedApiUsers();

    /** @DEV if in development mode, do some adjustments and pre-seeds */
    if (process.env.NODE_ENV === "development") {
        const testUserSeederService = app.get(RandomUsersSeeder);
        const realEncounterSeeder = app.get(Create10RealTestPeopleEncounters);

        console.log(`✓ Seeding Users and Encounters`);
        await testUserSeederService.seedRandomUsers();

        console.log("Seeding 10 real users");
        await realEncounterSeeder.seed();
        console.log("Seeded 10 real users");
    }

    await app.listen(TYPED_ENV.BE_PORT);
}

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle("Offlinery")
        .setDescription("API of Offlinery")
        .setVersion(API_VERSION)
        .addServer(`${BE_ENDPOINT}/v${API_VERSION}`) // will also be used in Frontend when generated
        .addTag("app")
        .build();
    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
        extraModels: [
            NotificationNavigateUserDTO,
            NotificationAccountApprovedDTO,
            NotificationGhostReminderDTO,
            NotificationNewEventDTO,
            EmailCodeResponseADTO,
            BaseNotificationADTO,
        ],
    });

    const outputPath = path.resolve(process.cwd(), "swagger.json");
    writeFileSync(outputPath, JSON.stringify(document), { encoding: "utf8" });

    SwaggerModule.setup("api", app, document);
};

/** @dev TypedENVs for better development experience. If a required env is not defined then backend should throw an error. */
const setupTypedEnvs = () => {
    try {
        validateEnv();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

bootstrap()
    .then(() =>
        console.log(
            `Backend started ${process.env.NODE_ENV ? `in ${process.env.NODE_ENV?.trim()} mode` : null}..`,
        ),
    )
    .catch(console.error);
