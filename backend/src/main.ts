import { DefaultApiUserSeeder } from "@/seeder/default-admin-api-user.seeder";
import { DefaultUserSeeder } from "@/seeder/default-user.seeder";
import { RandomEncounterSeeder } from "@/seeder/random-encounter-seeder.service";
import { RandomUsersSeeder } from "@/seeder/random-users-seeder.service";
import { INestApplication, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import helmet from "helmet";
import os from "os";
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
    setupSwagger(app);
    setupTypedEnvs();

    // @dev https://docs.nestjs.com/techniques/versioning
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // security base line
    app.use(helmet());

    // Seed the default use
    const userSeederService = app.get(DefaultUserSeeder);
    await userSeederService.seedDefaultUsers();

    const apiUserSeederService = app.get(DefaultApiUserSeeder);
    await apiUserSeederService.seedApiUsers();

    // Seed Test users if development mode
    if (process.env.NODE_ENV === "development") {
        console.log(`✓ Development mode active.`);

        console.log(`- Seeding Random Users`);
        const testUserSeederService = app.get(RandomUsersSeeder);
        await testUserSeederService.seedRandomUsers();

        console.log("- Seeding Encounters");
        const encounterSeederService = app.get(RandomEncounterSeeder);
        await encounterSeederService.seedRandomEncounters();
    }

    await app.listen(TYPED_ENV.BE_PORT);
}

const VERSION = "1";
const BE_ENDPOINT =
    process.env.NODE_ENV === "development"
        ? `http://localhost:${TYPED_ENV.BE_PORT}`
        : "https://offlinery.onrender.com";

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle("Offlinery")
        .setDescription("API of Offlinery")
        .setVersion(VERSION)
        .addServer(`${BE_ENDPOINT}/v${VERSION}`) // will also be used in Frontend when generated
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

const loadLocalIp = (): void => {
    const networkInterfaces = os.networkInterfaces();
    let localIpAddress = "localhost";

    // Look for an IPv4 address in the network interfaces
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        const interfaces = networkInterfaces[interfaceName];
        if (interfaces) {
            for (const iface of interfaces) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (iface.family === "IPv4" && !iface.internal) {
                    localIpAddress = iface.address;
                    break;
                }
            }
        }
        if (localIpAddress !== "localhost") return;
    });

    LOCAL_NETWORK_IP = localIpAddress;
};
export let LOCAL_NETWORK_IP: string | undefined;
loadLocalIp();

bootstrap()
    .then(() =>
        console.log(`Backend started on network IP ${LOCAL_NETWORK_IP}..`),
    )
    .catch(console.error);
