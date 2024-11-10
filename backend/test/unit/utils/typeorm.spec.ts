import { typeOrmAsyncConfig } from "@/typeorm.config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

describe("TypeORM Configuration", () => {
    let configService: ConfigService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
            ],
        }).compile();

        configService = moduleRef.get<ConfigService>(ConfigService);
    });

    it("should be defined", () => {
        expect(typeOrmAsyncConfig).toBeDefined();
    });

    it("should have useFactory defined", () => {
        expect(typeOrmAsyncConfig.useFactory).toBeDefined();
    });

    it("should have imports defined", () => {
        expect(typeOrmAsyncConfig.imports).toBeDefined();
    });

    it("should have inject defined", () => {
        expect(typeOrmAsyncConfig.inject).toBeDefined();
    });

    it("should return correct configuration", async () => {
        const config = await typeOrmAsyncConfig.useFactory(configService);

        expect(config).toMatchObject({
            type: "postgres",
            synchronize: false,
            autoLoadEntities: true,
            migrationsRun: true,
            logging: ["error", "schema", "warn", "info"],
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            username: configService.get<string>("DB_USER"),
            password: configService.get<string>("DB_PASSWORD"),
            database: configService.get<string>("DB_DATABASE"),
        });
    });
});
