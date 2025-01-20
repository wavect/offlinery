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
                intentions: [EIntention.RELATIONSHIP],
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

            const otherUserEncounter =
                await encounterService.findEncountersByUser(mainUser.id);

            expect(otherUserEncounter.length).toEqual(1); // fails with 0
            expect(userEncounters.length).toEqual(1); // fails with 0
            expect(
                !!userEncounters[0].users.find((u) => u.id === mainUser.id),
            ).toBeTruthy();
            expect(
                !!userEncounters[0].users.find((u) => u.id === userNearby.id),
            ).toBeTruthy();
        });
        it("should create the correct amount of encounters if more than one user is nearby when doing an location update [OF-398]", async () => {
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
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                firstName: "User1",
                location: new PointBuilder().build(0, 0),
            });
            await userFactory.persistNewTestUser({
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

            expect(userEncounters.length).toEqual(2);
        });
        it("should retrieve location if actually nearby", async () => {
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
                location: new PointBuilder().build(5, 5),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const encounter = await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
            );

            try {
                await encounterService.getLocationOfEncounter(
                    mainUser.id,
                    encounter.id,
                );
            } catch (e) {
                expect(e.toString()).toContain("is not nearby right now");
            }
        });
        it("should find and return the last location", async () => {
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
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const encounter = await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
            );

            const location = await encounterService.getLocationOfEncounter(
                mainUser.id,
                encounter.id,
            );

            expect(location.latitude).toEqual(0);
            expect(location.latitude).toEqual(0);
            expect(location.lastTimeLocationUpdated).toBeDefined();
        });
    });

    describe("should correctly manage and create encounters", () => {
        it("should find the correct amount of encounters", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const encounters = await encounterService.findEncountersByUser(
                mainUser.id,
            );

            expect(encounters.length).toEqual(0);
        });
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
        it("should create one single encounter after a longer priod for one single approach interaction", async () => {
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

            /*** @DEV main user and other user now should have an encounter */
            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);

            /** @DEV simulate time passed */
            await testSleep(5000);

            await userService.updateLocation(otherUser.id, {
                latitude: 0,
                longitude: 0,
            });

            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);
        });
        it("should create one single encounter for one single approach interaction", async () => {
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

            /*** @DEV main user and other user now should have an encounter */
            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);

            /** @DEV simulate time passed */
            await testSleep(500);

            await userService.updateLocation(otherUser.id, {
                latitude: 0,
                longitude: 0,
            });

            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);
        });
        it("should stress test the encounter matching", async () => {
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

            await Promise.all([
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                }),
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                }),
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                }),
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                }),
            ]);

            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);
        });
        it("should not create multiple encounters for a given pair if both users send location updates", async () => {
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

            for (let i = 0; i < 15; i++) {
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                userService.updateLocation(mainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                userService.updateLocation(mainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
            }

            // let the algorithm process it and wait for 5s
            await testSleep(5000);

            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);
        });
        it("should not create multiple encounters for a given pair if only one user send location updates", async () => {
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

            for (let i = 0; i < 5; i++) {
                userService.updateLocation(otherUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
                userService.updateLocation(mainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });
            }

            // let the algorithm process it and wait for 5s
            await testSleep(5000);

            expect(
                (await encounterService.findEncountersByUser(otherUser.id))
                    .length,
            ).toEqual(1);
            expect(
                (await encounterService.findEncountersByUser(mainUser.id))
                    .length,
            ).toEqual(1);
        });
    });

    describe("should handle streak logic accordingly", function () {
        it("initial encounter should have an amountStreaks of 1", async () => {
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
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const res = await encounterService.saveEncountersForUser(mainUser, [
                otherUser,
            ]);

            expect(res.get(otherUser.id).amountStreaks).toEqual(1);
        });
        it("should increase streak counter if met again", async () => {
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
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BOTH,
            });

            const res = await encounterService.saveEncountersForUser(mainUser, [
                otherUser,
            ]);

            expect(res.get(otherUser.id).amountStreaks).toEqual(1);

            const res2 = await encounterService.saveEncountersForUser(
                mainUser,
                [otherUser],
            );

            expect(res2.get(otherUser.id).amountStreaks).toEqual(2);

            const res3 = await encounterService.saveEncountersForUser(
                mainUser,
                [otherUser],
            );

            expect(res3.get(otherUser.id).amountStreaks).toEqual(3);
        });
    });

    describe("should manage location handling correctly", () => {
        it("should throw if no encounter was found", async () => {
            try {
                await encounterService.getLocationOfEncounter(
                    "00000000-0000-0000-0000-000000000000",
                    "00000000-0000-0000-0000-000000000000",
                );
            } catch (e) {
                expect(e.response.error).toEqual("Not Found");
                expect(e.response.statusCode).toEqual(404);
                expect(e.toString()).toContain("not found");
            }
        });
    });

    describe("should manage user location updates and notifications created", function () {
        it("should return the correct user, with correct notifications and expoPushTickets after location update", async () => {
            const userThatApproaches = await userFactory.persistNewTestUser({
                firstName: "Chris",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                pushToken: "ExponentPushToken[oQc_VGDj-r06r7d8hDF_2q]",
                approachChoice: EApproachChoice.APPROACH,
            });
            const userBeingApproached = await userFactory.persistNewTestUser({
                firstName: "Lisa",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                pushToken: "ExpoPushToken[be-approached-user]",
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            const { updatedUser, notifications, expoPushTickets } =
                await userService.updateLocation(userThatApproaches.id, {
                    latitude: 0,
                    longitude: 0,
                });

            expect(updatedUser).toBeDefined();
            expect(notifications.length).toEqual(1);
            expect(notifications[0].title).toContain(
                userBeingApproached.firstName,
            );
            expect(notifications[0].to).toEqual(userThatApproaches.pushToken);
            expect(expoPushTickets.length).toEqual(1);
            expect(expoPushTickets[0].status).toEqual("ok");
        });
        it("should return the correct user, with correct notifications and expoPushTickets after location update", async () => {
            const userThatApproaches = await userFactory.persistNewTestUser({
                firstName: "Chris",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
                pushToken: "ExponentPushToken[oQc_VGDj-r06r7d8hDF_2q]",
                approachChoice: EApproachChoice.APPROACH,
            });

            const userBeingApproached = await userFactory.persistNewTestUser({
                firstName: "Lisa",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                pushToken: "ExpoPushToken[be-approached-user]",
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            const { updatedUser, notifications, expoPushTickets } =
                await userService.updateLocation(userBeingApproached.id, {
                    latitude: 0,
                    longitude: 0,
                });

            expect(updatedUser).toBeDefined();
            expect(notifications.length).toEqual(1);
            expect(notifications[0].title).toContain(
                userBeingApproached.firstName,
            );
            expect(notifications[0].to).toEqual(userThatApproaches.pushToken);
            expect(expoPushTickets.length).toEqual(1);
            expect(expoPushTickets[0].status).toEqual("ok");
        });
    });
});
