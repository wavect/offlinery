import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase, testSleep } from "../../_src/utils/utils";

describe("Encounter Service Integration Tests ", () => {
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let encounterService: EncounterService;
    let userService: UserService;
    let userRepository: UserRepository;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        userRepository = module.get<UserRepository>(getRepositoryToken(User));
        userService = module.get<UserService>(UserService);
        encounterService = module.get<EncounterService>(EncounterService);
        encounterFactory = factories.get("encounter") as EncounterFactory;
        userFactory = factories.get("user") as UserFactory;
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);

        const birthDay = new Date("1996-09-21");
        testingMainUser = await userFactory.persistNewTestUser({
            firstName: "Testing Main User",
            dateMode: EDateMode.LIVE,
            location: new PointBuilder().build(0, 0),
            genderDesire: [EGender.WOMAN],
            gender: EGender.MAN,
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.APPROACH,
            birthDay,
            ageRangeString: `[${getAge(birthDay) - User.defaultAgeRange},${getAge(birthDay) + User.defaultAgeRange}]`,
        });
    });

    describe("if users are nearby, they should be marked as nearby", () => {
        it("should return the encounters a user has", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            /** @DEV insert 3 rest users */
            const user1 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            const user2 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * DPM), // Exactly at max distance
            });
            const user3 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser + 15) * DPM),
            });

            /** @DEV insert 3 test encounters to the user */
            await encounterFactory.persistTestEncounter(testingMainUser, user1);
            await encounterFactory.persistTestEncounter(testingMainUser, user2);
            await encounterFactory.persistTestEncounter(testingMainUser, user3);

            expect(
                (await encounterService.getEncountersByUser(testingMainUser.id))
                    .length,
            ).toEqual(3);
            expect(1).toEqual(1);
        });
        it("should mark users that are nearby", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            /** @DEV insert one user that is close, another one that is far away */
            const user1 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
            });
            const user2 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(
                    0,
                    (maxDistUser + 1500) * DPM,
                ),
            });

            /** @DEV insert 3 test encounters to the user */
            await encounterFactory.persistTestEncounter(testingMainUser, user1);
            await encounterFactory.persistTestEncounter(testingMainUser, user2);

            const encounters = await encounterService.getEncountersByUser(
                testingMainUser.id,
            );

            expect(encounters[0].isNearbyRightNow).toEqual(true);
            expect(encounters[1].isNearbyRightNow).toEqual(false);
            expect(encounters.length).toEqual(2);

            expect(1).toEqual(1);
        });
        it.failing(
            "should not create duplicate encounters [OF-391]",
            async () => {
                /** @DEV 2 users are around */
                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    location: new PointBuilder().build(0, 0),
                });
                await userFactory.persistNewTestUser({
                    firstName: "User2",
                    location: new PointBuilder().build(0, 0),
                });
                await userFactory.persistNewTestUser({
                    firstName: "User2",
                    location: new PointBuilder().build(0, 0),
                });

                await userService.updateLocation(testingMainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });

                /*** @DEV testing main user now should have 2 encounters */
                const user = await userRepository.findOne({
                    where: { id: testingMainUser.id },
                    relations: ["encounters"],
                });

                expect(user.encounters.length).toEqual(2);
            },
        );
        it.failing(
            "should create the correct amount of encounters if more than one user is nearby when doing an location update [OF-398]",
            async () => {
                /** @DEV 2 users are around */
                const user1 = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    location: new PointBuilder().build(0, 0),
                });
                const user2 = await userFactory.persistNewTestUser({
                    firstName: "User2",
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV do three location updated that trigger encounters */
                await userService.updateLocation(testingMainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                await testSleep(250);
                await userService.updateLocation(testingMainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                await testSleep(250);
                await userService.updateLocation(testingMainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                await testSleep(250);

                /** @DEV re-fetch users*/
                const user1AfterUpdate = await userRepository.findOne({
                    where: { firstName: user1.firstName },
                    relations: ["encounters"],
                });
                const user2AfterUpdate = await userRepository.findOne({
                    where: { firstName: user2.firstName },
                    relations: ["encounters"],
                });
                const mainTestingUserAfterUpdate = await userRepository.findOne(
                    {
                        where: { firstName: testingMainUser.firstName },
                        relations: ["encounters"],
                    },
                );

                expect(mainTestingUserAfterUpdate.encounters.length).toEqual(2);
                expect(user1AfterUpdate.encounters.length).toEqual(1);
                expect(user2AfterUpdate.encounters.length).toEqual(1);
            },
        );
    });
});
