import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EGenderDesire,
    EVerificationStatus,
} from "@/types/user.types";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("UserRepository ", () => {
    let userRepository: UserRepository;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;

    beforeAll(async () => {
        const { module, dataSource, mainUser, factories } =
            await getIntegrationTestModule();
        testingMainUser = mainUser;
        testingModule = module;
        testingDataSource = dataSource;
        userRepository = module.get<UserRepository>(UserRepository);

        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;

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
            await userFactory.persistTestUser({
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGenderDesire.MAN,
            });

            const userId2 = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGenderDesire.MAN,
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
            const userId = await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
            });
            const userId2 = await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
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
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            const user = await userFactory.persistTestUser({
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
            const userId = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGenderDesire.MAN,
            });
            const userId2 = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGenderDesire.MAN,
            });

            await userFactory.persistTestUser({
                gender: EGender.MAN,
                genderDesire: EGenderDesire.WOMAN,
            });

            await encounterFactory.persistTestEncounter(userId, userId2);

            const matches = Array.from(
                (
                    await userRepository.getPotentialMatchesForNotifications(
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
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            const user = await userFactory.persistTestUser({
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
            await userFactory.persistTestUser({
                verificationStatus: EVerificationStatus.PENDING,
            });

            await userFactory.persistTestUser({
                verificationStatus: EVerificationStatus.NOT_NEEDED,
            });

            const user = await userFactory.persistTestUser({
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
            const user1 = await userFactory.persistTestUser({
                approachChoice: EApproachChoice.BE_APPROACHED,
            });
            const user2 = await userFactory.persistTestUser({
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
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
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
