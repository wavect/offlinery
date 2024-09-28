import { DefaultApiUserSeeder } from "@/seeder/default-admin-api-user.seeder";
import { DefaultUserSeeder } from "@/seeder/default-user.seeder";
import { RandomUsersSeeder } from "@/seeder/random-users-seeder.service";
import { SpecificUsersEncountersSeeder } from "@/seeder/specific-encounter-seeder.service";
import { API_VERSION, BE_ENDPOINT } from "@/utils/misc.utils";
import { INestApplication, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import helmet from "helmet";
import * as path from "path";
import * as process from "process";
import { AppModule } from "./app.module";
import { NotificationNavigateUserDTO } from "./DTOs/notification-navigate-user.dto";
import { TYPED_ENV, validateEnv } from "./utils/env.utils";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
            optionsSuccessStatus: 204,
        },
    });

    const userSeederService = app.get(DefaultUserSeeder);
    const apiUserSeederService = app.get(DefaultApiUserSeeder);
    const testUserSeederService = app.get(RandomUsersSeeder);
    const encounterSeederService = app.get(SpecificUsersEncountersSeeder);

    setupSwagger(app);
    setupTypedEnvs();

    // @dev https://docs.nestjs.com/techniques/versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // security base line
    app.use(helmet());

    /** @DEV Either drop the DB or run this truncate service */
    // const appService = app.get(AppService);
    // await appService.truncateAllTables();

    await userSeederService.seedDefaultUsers();
    await apiUserSeederService.seedApiUsers();

    // Seed Test users if development mode
    if (process.env.NODE_ENV === "development") {
        console.log(`✓ Seeding Users and Encounters`);
        await testUserSeederService.seedRandomUsers();
        await encounterSeederService.seed();
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
        extraModels: [NotificationNavigateUserDTO],
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
