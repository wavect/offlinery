import { EncounterService } from "@/entities/encounter/encounter.service";
import { UserService } from "@/entities/user/user.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase, testSleep } from "../../_src/utils/utils";

describe("Encounter Service Integration Tests ", () => {
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let encounterService: EncounterService;
    let userService: UserService;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;
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
    });

    describe("if users are nearby, they should be marked as nearby", () => {
        it("should return the encounters a user has", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "Testing Main User",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });

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
            await encounterFactory.persistNewTestEncounter(mainUser, user1);
            await encounterFactory.persistNewTestEncounter(mainUser, user2);
            await encounterFactory.persistNewTestEncounter(mainUser, user3);

            expect(
                (await encounterService.getEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(3);
            expect(1).toEqual(1);
        });
        it("should mark users that are nearby", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "Testing Main User",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });
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
            await encounterFactory.persistNewTestEncounter(mainUser, user1);
            await encounterFactory.persistNewTestEncounter(mainUser, user2);

            const encounters = await encounterService.getEncountersByUser(
                mainUser.id,
            );

            expect(encounters[0].isNearbyRightNow).toEqual(true);
            expect(encounters[1].isNearbyRightNow).toEqual(null);
            expect(encounters.length).toEqual(2);

            expect(1).toEqual(1);
        });
        it("should not create duplicate encounters [OF-391]", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "Testing Main User",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });

            /** @DEV a user is nearby */
            const userNearby = await userFactory.persistNewTestUser({
                firstName: "User1",
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                location: new PointBuilder().build(0, 0),
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            await userService.updateLocation(mainUser.id, {
                latitude: 0,
                longitude: 0,
            });

            /** @DEV a bit later, the other user sends a location update */
            await userService.updateLocation(userNearby.id, {
                latitude: 0,
                longitude: 0,
            });

            const userEncounters = await encounterService.findEncountersByUser(
                userNearby.id,
            );

            expect(userEncounters.length).toEqual(1);
            expect(
                !!userEncounters[0].users.find((u) => u.id === mainUser.id),
            ).toBeTruthy();
            expect(
                !!userEncounters[0].users.find((u) => u.id === userNearby.id),
            ).toBeTruthy();
        });
        it.skip("should create the correct amount of encounters if more than one user is nearby when doing an location update [OF-398]", async () => {
            /** @DEV user sending location update */
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "Testing Main User",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
            });
            /** @DEV 2 users are around */
            const user1 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                firstName: "User1",
                location: new PointBuilder().build(0, 0),
            });
            const user2 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                firstName: "User2",
                location: new PointBuilder().build(0, 0),
            });

            /** @DEV do three location updated that trigger encounters */
            await userService.updateLocation(mainUser.id, {
                latitude: 0,
                longitude: 0,
            });
            await testSleep(250);

            /** @DEV fetch encounters by user */
            const userEncounters = await encounterService.findEncountersByUser(
                mainUser.id,
            );

            const encounterOne = userEncounters[0];
            const encounterTwo = userEncounters[1];

            expect(userEncounters.length).toEqual(2);
            expect(
                !!encounterOne.users.find((u) => u.id === mainUser.id),
            ).toBeTruthy();
            expect(
                !!encounterOne.users.find((u) => u.id === user1.id),
            ).toBeTruthy();
            expect(
                !!encounterTwo.users.find((u) => u.id === mainUser.id),
            ).toBeTruthy();
            expect(
                !!encounterTwo.users.find((u) => u.id === user2.id),
            ).toBeTruthy();
        });
    });

    describe("should correctly manage and create encounters", () => {
        it("should create an encounter with choice: APP", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });

            const otherUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            await userService.updateLocation(mainUser.id, {
                latitude: 0,
                longitude: 0,
            });

            /*** @DEV testing main user now should have an encounter */
            const mainUserAfterLookup =
                await encounterService.findEncountersByUser(mainUser.id);

            /** @DEV fetch encounters by user */
            const otherUserAfterLookup =
                await encounterService.findEncountersByUser(otherUser.id);

            expect(mainUserAfterLookup.length).toEqual(1);
            expect(otherUserAfterLookup.length).toEqual(1);
        });
        it("should create an encounter with choice: BE_APP", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            const otherUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });

            await userService.updateLocation(otherUser.id, {
                latitude: 0,
                longitude: 0,
            });

            /*** @DEV testing main user now should have an encounter */
            const mainUserAfterLookup =
                await encounterService.findEncountersByUser(mainUser.id);

            /** @DEV fetch encounters by user */
            const otherUserAfterLookup =
                await encounterService.findEncountersByUser(otherUser.id);

            expect(mainUserAfterLookup.length).toEqual(1);
            expect(otherUserAfterLookup.length).toEqual(1);
        });
        it("should create an encounter with choice: BOTH 1", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const otherUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
            });

            await userService.updateLocation(otherUser.id, {
                latitude: 0,
                longitude: 0,
            });

            /*** @DEV testing main user now should have an encounter */
            const mainUserAfterLookup =
                await encounterService.findEncountersByUser(mainUser.id);

            /** @DEV fetch encounters by user */
            const otherUserAfterLookup =
                await encounterService.findEncountersByUser(otherUser.id);

            expect(mainUserAfterLookup.length).toEqual(1);
            expect(otherUserAfterLookup.length).toEqual(1);
        });
        it("should create an encounter with choice: BOTH 2", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const otherUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            await userService.updateLocation(otherUser.id, {
                latitude: 0,
                longitude: 0,
            });

            /*** @DEV testing main user now should have an encounter */
            const mainUserAfterLookup =
                await encounterService.findEncountersByUser(mainUser.id);

            /** @DEV fetch encounters by user */
            const otherUserAfterLookup =
                await encounterService.findEncountersByUser(otherUser.id);

            expect(mainUserAfterLookup.length).toEqual(1);
            expect(otherUserAfterLookup.length).toEqual(1);
        });
        it("should not create more than 3 encounters for a user per day", async () => {
            const amountOfUsersInThisTest = 10;

            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const amountOfPotentialMatches =
                await userFactory.persistNewTestUserMany(
                    amountOfUsersInThisTest,
                    {
                        dateMode: EDateMode.LIVE,
                        location: new PointBuilder().build(0, 0),
                        gender: EGender.WOMAN,
                        genderDesire: [EGender.MAN],
                        intentions: [EIntention.RELATIONSHIP],
                        approachChoice: EApproachChoice.BOTH,
                    },
                );

            /*** @DEV update location, check encounter size. Then, update again */
            await userService.updateLocation(mainUser.id, {
                latitude: 0,
                longitude: 0,
            });
            expect(amountOfPotentialMatches.length).toEqual(10);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(3);

            /*** @DEV update location, check encounter size. Then, update again */
            await userService.updateLocation(mainUser.id, {
                latitude: 0,
                longitude: 0,
            });
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(3);
        });
    });
});
