import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EGender,
    EIntention,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { parseToAgeRangeString } from "@/utils/misc.utils";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { BlacklistedRegionBuilder } from "../../_src/builders/blacklisted-region.builder";
import { PointBuilder } from "../../_src/builders/point.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import {
    clearDatabase,
    testChrisNativeAndroidPushToken,
    testChrisNativeIosPushToken,
} from "../../_src/utils/utils";

describe("Matching Service Integration Tests ", () => {
    let matchingService: MatchingService;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;
    let userFactory: UserFactory;
    let userService: UserService;
    let encounterFactory: EncounterFactory;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        userService = module.get(UserService);
        matchingService = module.get(MatchingService);
        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);

        const birthDay = new Date("1996-09-21");
        testingMainUser = await userFactory.persistNewTestUser({
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

    describe("should test edge cases prior to retrieving users", () => {
        it("should not fetch notification matches if the user is not live", async () => {
            const userToBeApproached = await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });

            expect(
                await matchingService.findNearbyMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch notification matches if the user has no locations", async () => {
            const userToBeApproached = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: null,
            });

            expect(
                await matchingService.findNearbyMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch heatmap locations if the user is not live", async () => {
            const userToBeApproached = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: null,
            });

            expect(
                await matchingService.findHeatmapMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch heatmap matches if the user has no locations", async () => {
            const userToBeApproached = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: null,
            });

            expect(
                await matchingService.findNearbyMatches(userToBeApproached),
            ).toEqual([]);
        });
    });

    describe("should test nearby-match algorithm", () => {
        it("should only find users if man and woman is desired", async () => {
            await userFactory.persistNewTestUser({
                gender: EGender.MAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });
            const userId1 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId1.id]),
            );
        });
        it("should only find users that are live", async () => {
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            const user = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
        it("should only find users that want to be approached", async () => {
            const user1 = await userFactory.persistNewTestUser({
                approachChoice: EApproachChoice.BE_APPROACHED,
            });
            const user2 = await userFactory.persistNewTestUser({
                approachChoice: EApproachChoice.BE_APPROACHED,
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(2);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user1.id, user2.id]),
            );
        });
        it("should only find users that are the right gender and intentions", async () => {
            const userId = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
            });
            const userId2 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
            });

            await userFactory.persistNewTestUser({
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.CASUAL],
            });

            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.CASUAL],
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(2);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId.id, userId2.id]),
            );
        });
        it("should only find users with a recent location update", async () => {
            const now = new Date();
            const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

            const baseConfiguration = {
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
            };

            const oldUser1 = await userFactory.persistNewTestUser({
                ...baseConfiguration,
                locationLastTimeUpdated: fourHoursAgo,
            });

            const oldUser2 = await userFactory.persistNewTestUser({
                ...baseConfiguration,
                locationLastTimeUpdated: new Date(
                    now.getTime() - 5 * 60 * 60 * 1000,
                ),
            });

            const recentUser1 = await userFactory.persistNewTestUser({
                ...baseConfiguration,
                locationLastTimeUpdated: twoHoursAgo,
            });

            const recentUser2 = await userFactory.persistNewTestUser({
                ...baseConfiguration,
                locationLastTimeUpdated: new Date(
                    now.getTime() - 2 * 60 * 60 * 1000,
                ),
            });

            const matches =
                await matchingService.findNearbyMatches(testingMainUser);

            expect(matches.length).toBe(2);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([recentUser1.id, recentUser2.id]),
            );
            expect(matches.map((m) => m.id)).not.toContain(oldUser1.id);
            expect(matches.map((m) => m.id)).not.toContain(oldUser2.id);
        });
        it("should not find users if genderDesire of personB is wrong.", async () => {
            const userId = await userFactory.persistNewTestUser({
                gender: EGender.MAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.WOMAN],
            });

            const matches = Array.from(
                (await matchingService.findNearbyMatches(userId)).values(),
            );

            expect(matches.length).toBe(0);
        });
        it("should not find users that are ghost", async () => {
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(0);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([]),
            );
        });
        it("should not find more than 3 users", async () => {
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });
            await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN, EGender.WOMAN],
            });

            const matches = Array.from(
                (
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(3);
        });
    });

    describe("should test users within blacklisted regions", () => {
        it("should not return a match for a blacklisted region", async () => {
            /** @DEV random user sitting at home (in blacklisted region) */
            const userInBlacklistedRegion =
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(0, 0),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(0, 0))
                            .withRadius(10000)
                            .build(),
                    ],
                });

            const userToMatch = await userFactory.persistNewTestUser({
                location: testingMainUser.location,
            });

            /** @DEV random user in another town */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(100, 100),
            });

            const matches =
                await matchingService.findNearbyMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userToMatch.id]),
            );
            expect(matches.map((m) => m.id)).not.toContain(
                userInBlacklistedRegion.id,
            );
        });
        it("should return nearby users that are not in their blacklisted regions", async () => {
            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(5, 5))
                        .build(),
                ],
            });

            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(10, 10))
                        .build(),
                ],
            });

            /** @DEV user IN his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(15, 15))
                        .build(),
                ],
            });

            expect(
                (await matchingService.findNearbyMatches(testingMainUser))
                    .length,
            ).toEqual(3);
        });
        it("should return nearby users and consider users that are in their blacklisted regions", async () => {
            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(5, 5))
                        .build(),
                ],
            });

            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(0, 0))
                        .build(),
                ],
            });

            /** @DEV user IN his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0.01, 0.01),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(0.01, 0.01))
                        .build(),
                ],
            });

            expect(
                (await matchingService.findNearbyMatches(testingMainUser))
                    .length,
            ).toEqual(1);
        });
        it("should return users not in their blacklisted regions with precise radius I", async () => {
            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(0.15, 0.15))
                        .withRadius(25_000)
                        .build(),
                ],
            });
            expect(
                (await matchingService.findNearbyMatches(testingMainUser))
                    .length,
            ).toEqual(0);
        });
        it("should return users not in their blacklisted regions with precise radius II ", async () => {
            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(0.001, 0.001))
                        .withRadius(158) // 158 exceeds 0 <> 0.001
                        .build(),
                ],
            });
            expect(
                (await matchingService.findNearbyMatches(testingMainUser))
                    .length,
            ).toEqual(0);
        });
        it("should return users not in their blacklisted regions with precise radius III ", async () => {
            /** @DEV user not in his blacklisted region, but nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(0.001, 0.001))
                        .withRadius(100) // 100 is not within 0 <> 0.001
                        .build(),
                ],
            });
            expect(
                (await matchingService.findNearbyMatches(testingMainUser))
                    .length,
            ).toEqual(1);
        });
    });

    describe("should test heatmap-match algorithm", () => {
        it("should only find users that are the right gender", async () => {
            await userFactory.persistNewTestUser({
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: [EGender.MAN],
            });

            const userId2 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId2.id]),
            );
            expect(matches.length).toBe(1);
        });
        it("should only find users that are live", async () => {
            const userId = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
            });
            const userId2 = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId.id, userId2.id]),
            );
            expect(matches.length).toBe(3);
        });
        it("should only find users in the right age span", async () => {
            const testingUsersBirthYear =
                testingMainUser.birthDay.getFullYear();

            await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 25}-01-01`),
            });
            await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 20}-01-01`),
            });
            await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 15}-01-01`),
            });
            await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 10}-01-01`),
            });
            // -- within start age range
            const user1 = await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 5}-01-01`),
            });
            const user2 = await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear - 1}-01-01`),
            });
            const user3 = await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear + 5}-01-01`),
            });
            // -- within end age range
            await userFactory.persistNewTestUser({
                birthDay: new Date(`${testingUsersBirthYear + 10}-01-01`),
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user1.id, user2.id, user3.id]),
            );
            expect(matches.length).toEqual(3);
        });
        it("should find user when age is upper bound", async () => {
            const upperBound = 35;
            const user1 = await userFactory.persistNewTestUser({
                birthDay: new Date(`2000-01-01`),
                ageRangeString: parseToAgeRangeString([18, upperBound]),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
            });
            const today = new Date();
            const user2 = await userFactory.persistNewTestUser({
                birthDay: new Date(`${today.getFullYear() - upperBound}-01-01`),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
            });

            const matches = await matchingService.findHeatmapMatches(user1);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user2.id]),
            );
        });
        it("should not find users that are ghost", async () => {
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
            });
            const user = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
            expect(matches.length).toBe(1);
        });
    });

    describe("should test users within distance", () => {
        const maxDistUser = 1500;
        const DPM = 1 / 111139;
        it("should consider users locations for nearby-matches", async () => {
            const user1 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 0.5 * DPM), // 50% of max distance
            });
            const user2 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 0.9 * DPM), // 90% of max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 1.1 * DPM), // 110% of max distance
            });

            const matches =
                await matchingService.findNearbyMatches(testingMainUser);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user1.id, user2.id]),
            );
            expect(matches.length).toEqual(2);
        });
        it("should consider precise distance cases for nearby-matches within maxDistUser", async () => {
            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                birthDay: new Date("1996-09-21"),
            });

            const user1499m = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            const user1500m = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * DPM), // Exactly at max distance
            });
            const user1501m = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(
                    0,
                    (maxDistUser + 150) * DPM,
                ), // 1 meter more than max
            });

            const matches =
                await matchingService.findNearbyMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user1499m.id, user1500m.id]),
            );
            expect(matches.map((m) => m.id)).not.toContain(user1501m.id);
        });
        it("should send a notification to a REAL device after a match nearby was found on iOS", async () => {
            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: testChrisNativeIosPushToken,
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                birthDay: new Date("1996-09-21"),
            });

            /** @DEV three random users that are nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * DPM), // Exactly at max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser + 15) * DPM),
            });

            /** @DEV location update that triggers notifyMatches */
            const userUpdated = await userService.updateLocation(
                testingMainUser.id,
                {
                    latitude: 0,
                    longitude: 0,
                },
            );

            /** expect to run through without failure */
            expect(userUpdated).toBeDefined();
        });
        it("should send a notification to a REAL device after a match nearby was found on android", async () => {
            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: testChrisNativeAndroidPushToken,
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                birthDay: new Date("1996-09-21"),
            });

            /** @DEV three random users that are nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * DPM), // Exactly at max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser + 15) * DPM),
            });

            /** @DEV location update that triggers notifyMatches */
            const userUpdated = await userService.updateLocation(
                testingMainUser.id,
                {
                    latitude: 0,
                    longitude: 0,
                },
            );

            /** expect to run through without failure */
            expect(userUpdated).toBeDefined();
        });
        it("should not send more than 3 notification per day to a REAL device after a match nearby was found", async () => {
            const testingMainUser = await userFactory.persistNewTestUser({
                firstName: "UserApproachingOthers",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: testChrisNativeIosPushToken,
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                birthDay: new Date("1996-09-21"),
            });

            /** @DEV three random users that are nearby */
            await userFactory.persistNewTestUser({
                pushToken: "PushToken987",
                firstName: "Tina",
                approachChoice: EApproachChoice.BE_APPROACHED,
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });

            /** @DEV location update that triggers notifyMatches */
            const notifications =
                await matchingService.checkForEncounters(testingMainUser);

            expect(notifications.length).toEqual(1);
            const notificationUnderTest = notifications[0];
            expect(notificationUnderTest.data.screen).toEqual(
                "Main_NavigateToApproach",
            );
            expect(notificationUnderTest.title).toEqual("Tina is nearby! 🔥");
            expect(notificationUnderTest.to).toEqual(
                testChrisNativeIosPushToken,
            );
            expect(notificationUnderTest.data);
            expect(
                (notificationUnderTest.data as NotificationNavigateUserDTO)
                    .encounterId,
            ).toBeDefined();
        });
        it("should not consider users locations for heatmap", async () => {
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 0.9 * DPM), // 90% of max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 0.5 * DPM), // 50% of max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * 1.1 * DPM), // 110% of max distance
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);
            expect(matches.length).toEqual(3);
        });
    });

    describe("should tests users that approach each other", () => {
        it("should test happy path: one user approaches another and gets a notification", async () => {
            const userService = testingModule.get<UserService>(UserService);
            const matchingService =
                testingModule.get<MatchingService>(MatchingService);
            const girlWantsToBeApproached =
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(0.005, 0.005),
                    gender: EGender.WOMAN,
                    genderDesire: [EGender.MAN],
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

            const preDefinedLocations = [
                [0.00001, 0.00001],
                [0.0001, 0.0001],
                [0.001, 0.001],
            ];

            // Spy on matchingService.notifyMatches
            const notifyMatchesSpy = jest.spyOn(
                matchingService,
                "checkForEncounters",
            );

            /*** @DEV User approaches another user */
            for (let i = 0; i < 3; i++) {
                await userService.updateLocation(testingMainUser.id, {
                    latitude: preDefinedLocations[i][0],
                    longitude: preDefinedLocations[i][1],
                });

                testingMainUser = await userService.findUserById(
                    testingMainUser.id,
                );
                expect(testingMainUser.location.coordinates[0]).toEqual(
                    preDefinedLocations[i][0],
                );
                expect(testingMainUser.location.coordinates[1]).toEqual(
                    preDefinedLocations[i][1],
                );
            }

            /*** @DEV Now the user TO BE approach slightly moves, triggering a location update and notification */
            await userService.updateLocation(girlWantsToBeApproached.id, {
                longitude: 0.001,
                latitude: 0.001,
            });

            /** @DEV User that approaches, receives a notification about a girl nearby */
            expect(notifyMatchesSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: girlWantsToBeApproached.id,
                }),
            );
        });
        it("should not create a notification if the encounter status is met_not_interested", async () => {
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

            await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
                {
                    status: EEncounterStatus.MET_NOT_INTERESTED,
                    userStatuses: {
                        [mainUser.id]: EEncounterStatus.MET_NOT_INTERESTED,
                        [otherUser.id]: EEncounterStatus.MET_NOT_INTERESTED,
                    },
                },
            );

            const notifications =
                await matchingService.checkForEncounters(testingMainUser);

            expect(notifications).toEqual([]);
        });
    });

    describe("should test re-sending notifications", function () {
        it("should not create a notification if status is not_interested, regardless of time", async () => {
            const date24HrsAgo = new Date(
                new Date().getTime() - 24 * 60 * 60 * 1000,
            );
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

            await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
                {
                    lastDateTimePassedBy: date24HrsAgo,
                    status: EEncounterStatus.MET_NOT_INTERESTED,
                },
            );

            const notifications =
                await matchingService.checkForEncounters(mainUser);

            expect(notifications.length).toEqual(0);
        });
        it("should not create a notification if less than 24 hrs ago and not met", async () => {
            const date22HrsAgo = new Date(
                new Date().getTime() - 22 * 60 * 60 * 1000,
            );
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

            await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
                {
                    lastDateTimePassedBy: date22HrsAgo,
                },
            );

            const notifications =
                await matchingService.checkForEncounters(mainUser);

            expect(notifications.length).toEqual(0);
        });
        it("should create a notification if not met and 24hrs or more ago", async () => {
            const date26HrsAgo = new Date(
                new Date().getTime() - 25 * 60 * 60 * 1000,
            );
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

            await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
                {
                    lastDateTimePassedBy: date26HrsAgo,
                    status: EEncounterStatus.NOT_MET,
                },
            );

            const notifications =
                await matchingService.checkForEncounters(mainUser);

            expect(notifications.length).toEqual(1);
        });
        it("should create a notification if not met and 24hrs ago", async () => {
            const date24HrsAgo = new Date(
                new Date().getTime() - 24 * 60 * 60 * 1000,
            );
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

            await encounterFactory.persistNewTestEncounter(
                mainUser,
                otherUser,
                {
                    lastDateTimePassedBy: date24HrsAgo,
                    status: EEncounterStatus.NOT_MET,
                },
            );

            const notifications =
                await matchingService.checkForEncounters(mainUser);

            expect(notifications.length).toEqual(1);
        });
    });
});
