import { ConfigModule, ConfigService } from "@nestjs/config";
import {
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from "@nestjs/typeorm";
import { validateEnv } from "./utils/env.utils";
import { IS_DEV_MODE } from "./utils/misc.utils"; // @dev Keep relative import for typeorm cli here

const baseConfig: TypeOrmModuleOptions = {
    type: "postgres",
    synchronize: IS_DEV_MODE,
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
