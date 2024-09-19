import { ConfigModule, ConfigService } from "@nestjs/config";
import {
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { TYPED_ENV, validateEnv } from "./utils/env.utils"; // @dev Keep relative import for typeorm cli here

const baseConfig: TypeOrmModuleOptions = {
    type: "postgres",
    synchronize: true, // TODO: Remove in prod
    autoLoadEntities: true,
    migrationsRun: true,
    logging: ["error", "schema", "warn", "info"],
    migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
};

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (
        configService: ConfigService,
    ): Promise<TypeOrmModuleOptions> => {
        validateEnv();
        return {
            ...baseConfig,
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            username: configService.get<string>("DB_USER"),
            password: configService.get<string>("DB_PASSWORD"),
            database: configService.get<string>("DB_DATABASE"),
        };
    },
};

export const connectionSource = new DataSource({
    ...baseConfig,
    host: TYPED_ENV.DB_HOST,
    port: TYPED_ENV.DB_PORT,
    username: TYPED_ENV.DB_USER,
    password: TYPED_ENV.DB_PASSWORD,
    database: TYPED_ENV.DB_DATABASE,
} as DataSourceOptions);
