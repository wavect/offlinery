import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "@/types/user.types";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { createRandomAppUser } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("UserRepository ", () => {
    let userRepository: UserRepository;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;

    beforeAll(async () => {
        const { module, dataSource, mainUser } =
            await getIntegrationTestModule();
        testingMainUser = mainUser;
        testingModule = module;
        testingDataSource = dataSource;
        userRepository = module.get<UserRepository>(UserRepository);

        expect(testingMainUser).toBeDefined();
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
    });

    describe("get user positions for HeatMaps", () => {
        it("Should only find users that are the right GENDER", async () => {
            await createRandomAppUser(userRepository, {
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
            });

            const userId2 = await createRandomAppUser(userRepository, {
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            const matches =
                await userRepository.getPotentialMatchesForHeatMap(
                    testingMainUser,
                );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId2.id]),
            );
        });
        it("Should only find users that are LIVE", async () => {
            const userId = await createRandomAppUser(userRepository, {
                dateMode: EDateMode.LIVE,
            });
            const userId2 = await createRandomAppUser(userRepository, {
                dateMode: EDateMode.LIVE,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.LIVE,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });

            const matches =
                await userRepository.getPotentialMatchesForHeatMap(
                    testingMainUser,
                );

            expect(matches.length).toBe(3);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId.id, userId2.id]),
            );
        });
        it("Should not find users that are GHOST", async () => {
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            const user = await createRandomAppUser(userRepository, {
                dateMode: EDateMode.LIVE,
            });

            const matches =
                await userRepository.getPotentialMatchesForHeatMap(
                    testingMainUser,
                );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
    });

    /** @DEV needs a complete refactoring, as we truly only check for ENCOUNTERS when sending notifications */
    /** @DEV hence we need to insert users here with encounters */
    describe.skip("get users for encounters / notifications", () => {
        it("Should only find users that are the right GENDER", async () => {
            const userId = await createRandomAppUser(userRepository, {
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            const userId2 = await createRandomAppUser(userRepository, {
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            await createRandomAppUser(userRepository, {
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
            });

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForHeatMap(
                        testingMainUser,
                    )
                ).values(),
            );

            expect(matches.length).toBe(2);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId.id, userId2.id]),
            );
        });
        it("Should only find users that are LIVE", async () => {
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            const user = await createRandomAppUser(userRepository, {
                dateMode: EDateMode.LIVE,
            });

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForNotifications(
                        testingMainUser,
                    )
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
        it("Should only find users that are VERIFIED", async () => {
            await createRandomAppUser(userRepository, {
                verificationStatus: EVerificationStatus.PENDING,
            });

            await createRandomAppUser(userRepository, {
                verificationStatus: EVerificationStatus.NOT_NEEDED,
            });

            const user = await createRandomAppUser(userRepository, {
                verificationStatus: EVerificationStatus.VERIFIED,
            });

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForNotifications(
                        testingMainUser,
                    )
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });

        it("Should only find users that want to be APPROACHED", async () => {
            const user1 = await createRandomAppUser(userRepository, {
                approachChoice: EApproachChoice.BE_APPROACHED,
            });
            const user2 = await createRandomAppUser(userRepository, {
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForNotifications(
                        testingMainUser,
                    )
                ).values(),
            );

            expect(matches.length).toBe(2);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user1.id, user2.id]),
            );
        });
        it("Should not find users that are GHOST", async () => {
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });
            await createRandomAppUser(userRepository, {
                dateMode: EDateMode.GHOST,
            });

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForNotifications(
                        testingMainUser,
                    )
                ).values(),
            );

            expect(matches.length).toBe(0);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([]),
            );
        });
    });
});
