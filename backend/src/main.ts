import { INestApplication, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync } from "fs";
import helmet from "helmet";
import * as path from "path";
import { AppModule } from "./app.module";
import { NotificationNavigateUserDTO } from "./DTOs/notification-navigate-user.dto";
import { validateEnv } from "./utils/env.utils";

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

    await app.listen(3000);
}

const VERSION = "1";
const BE_ENDPOINT =
    process.env.NODE_ENV === "development"
        ? `http://localhost:${process.env.BE_PORT}`
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

bootstrap()
    .then(() => console.log("Backend started.."))
    .catch(console.error);
