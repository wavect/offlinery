import { AuthModule } from "@/auth/auth.module";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { ELanguage } from "@/types/user.types";
import { TYPED_ENV } from "@/utils/env.utils";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import {
    AcceptLanguageResolver,
    HeaderResolver,
    I18nModule,
    QueryResolver,
} from "nestjs-i18n";
import path from "node:path";
import { join } from "path";
import { DataSource } from "typeorm";
import {
    createMainAppUser,
    MAN_WANTS_WOMAN_TESTUSER,
} from "../factories/user.factory";

interface TestModuleSetup {
    module: TestingModule;
    mainUser: User;
    dataSource: DataSource;
}

export const getIntegrationTestModule = async (): Promise<TestModuleSetup> => {
    const module = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: "postgres",
                host: "localhost",
                port: 5433,
                username: "test_user",
                password: "test_password",
                database: "test_offlinery",
                entities: [
                    User,
                    BlacklistedRegion,
                    UserReport,
                    Encounter,
                    Message,
                    PendingUser,
                ],
                synchronize: true,
                dropSchema: true,
                logging: ["error", "schema", "warn", "info"],
                migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
                migrationsRun: true,
            }),
            TypeOrmModule.forFeature([
                User,
                BlacklistedRegion,
                Encounter,
                PendingUser,
                Message,
            ]),
            MatchingModule,
            MailerModule.forRoot({
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
                    dir: join(__dirname, "../../mail/templates"),
                    adapter: new HandlebarsAdapter(),
                },
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
            AuthModule,
        ],
        providers: [UserRepository, UserService],
    }).compile();

    const userRepository = module.get<UserRepository>(getRepositoryToken(User));
    const dataSource = module.get<DataSource>(DataSource);

    // Ensure the database is synced and migrations are run
    await dataSource.synchronize(true);
    await dataSource.runMigrations();

    /** @DEV Initialize PostGIS and populate spatial_ref_sys */
    await initializePostGIS(dataSource);

    await createMainAppUser(userRepository);
    const mainUser = await userRepository.findOne({
        where: { firstName: MAN_WANTS_WOMAN_TESTUSER },
    });

    if (!mainUser) {
        throw new Error("Failed to create or retrieve main testing user");
    }

    return { module, mainUser, dataSource };
};

async function initializePostGIS(dataSource: DataSource) {
    try {
        // Enable PostGIS extension if not already enabled
        await dataSource.query("CREATE EXTENSION IF NOT EXISTS postgis;");

        // Check if EPSG:4326 is already in spatial_ref_sys
        const existingRecord = await dataSource.query(
            "SELECT * FROM spatial_ref_sys WHERE srid = 4326;",
        );

        if (existingRecord.length === 0) {
            console.log("Inserting EPSG:4326 into spatial_ref_sys table...");
            await dataSource.query(`
                INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) 
                VALUES (
                  4326,
                  'EPSG',
                  4326,
                  'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]',
                  '+proj=longlat +datum=WGS84 +no_defs'
                );
              `);
            console.log("EPSG:4326 inserted successfully.");
        } else {
            console.log("EPSG:4326 already exists in spatial_ref_sys table.");
        }
    } catch (error) {
        console.error("Error initializing PostGIS:", error);
        throw error;
    }
}

export { TestModuleSetup };
