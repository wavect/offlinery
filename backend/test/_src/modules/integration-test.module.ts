import { i18nLngModule } from "@/app.module.configuration";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { MapModule } from "@/entities/map/map.module";
import { Message } from "@/entities/messages/message.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { PendingUserModule } from "@/entities/pending-user/pending-user.module";
import { UserFeedback } from "@/entities/user-feedback/user-feedback.entity";
import { UserFeedbackModule } from "@/entities/user-feedback/user-feedback.module";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserReportModule } from "@/entities/user-report/user-report.module";
import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { UserRepository } from "@/entities/user/user.repository";
import { ClusteringModule } from "@/transient-services/clustering/clustering.module";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { TYPED_ENV } from "@/utils/env.utils";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { Module } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { DataSource, Repository } from "typeorm";
import { EncounterFactory } from "../factories/encounter.factory";
import {
    FactoryInterface,
    FactoryPair,
    TestFactory,
} from "../factories/factory.interface";
import { UserFactory } from "../factories/user.factory";

interface TestModuleSetup {
    module: TestingModule;
    dataSource: DataSource;
    factories: FactoryPair;
}

// Create mock modules to break circular dependencies
@Module({})
class MockAuthModule {}

@Module({})
class MockMatchingModule {}

export const getIntegrationTestModule = async (): Promise<TestModuleSetup> => {
    const module: TestingModule = await Test.createTestingModule({
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
                    UserFeedback,
                ],
                synchronize: true,
                dropSchema: true,
                logging: ["error", "schema", "warn", "info"],
                migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
                migrationsRun: true,
            }),
            UserModule,
            MockAuthModule,
            UserReportModule,
            MapModule,
            ClusteringModule,
            MockMatchingModule,
            UserFeedbackModule,
            PendingUserModule,
            EncounterModule,
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
                    dir: join(__dirname, "../../mail"),
                    adapter: new HandlebarsAdapter(),
                },
            }),
            i18nLngModule,
        ],
    }).compile();

    const userRepository = module.get<UserRepository>(getRepositoryToken(User));
    const encounterRepository = module.get<Repository<Encounter>>(
        getRepositoryToken(Encounter),
    );
    const blacklistedRegionRepository = module.get<
        Repository<BlacklistedRegion>
    >(getRepositoryToken(BlacklistedRegion));

    const dataSource = module.get<DataSource>(DataSource);

    /** @DEV Database Operations - Ensure the database is synced and migrations are run */
    await dataSource.synchronize(true);
    await dataSource.runMigrations();
    await initializePostGIS(dataSource); /** PostGIS/populate spatial_ref_sys */

    /** @DEV Test Factories - create and get testing factories */
    const userFactory = new UserFactory(
        userRepository,
        blacklistedRegionRepository,
    );
    const encounterFactory = new EncounterFactory(
        userRepository,
        encounterRepository,
    );
    const factories = new Map<TestFactory, FactoryInterface>([
        ["user", userFactory],
        ["encounter", encounterFactory],
    ]);

    return { module, dataSource, factories };
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
