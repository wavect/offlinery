import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
    createMainAppUser,
    MAN_WANTS_WOMAN_TESTUSER,
} from "../builders/db-test-manager";

interface TestModuleSetup {
    module: TestingModule;
    mainUser: User;
    userRepository: UserRepository;
    dataSource: DataSource;
}

export const getIntegrationTestMemoryDbModule =
    async (): Promise<TestModuleSetup> => {
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
                        UserReport,
                        BlacklistedRegion,
                        Encounter,
                        Message,
                    ],
                    synchronize: true,
                    logger: "advanced-console",
                }),
                TypeOrmModule.forFeature([User, BlacklistedRegion, Encounter]),
            ],
            providers: [UserRepository],
        }).compile();

        const userRepository = module.get<UserRepository>(
            getRepositoryToken(User),
        );
        const dataSource = module.get<DataSource>(DataSource);

        await createMainAppUser(userRepository);
        const mainUser = await userRepository.findOne({
            where: { firstName: MAN_WANTS_WOMAN_TESTUSER },
        });

        if (!mainUser) {
            throw new Error("Failed to create or retrieve main testing user");
        }

        return { module, mainUser, userRepository, dataSource };
    };

export { TestModuleSetup };
