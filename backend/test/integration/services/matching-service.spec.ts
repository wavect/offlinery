import { User } from "@/entities/user/user.entity";
import { MatchingService } from "@/transient-services/matching/matching.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "@/types/user.types";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { BlacklistedRegionBuilder } from "../../_src/builders/blacklisted-region.builder";
import { PointBuilder } from "../../_src/builders/point.builder";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("MatchingService ", () => {
    let matchingService: MatchingService;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;
    let userFactory: UserFactory;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        matchingService = module.get(MatchingService);
        userFactory = factories.get("user") as UserFactory;
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
        testingMainUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.LIVE,
            location: new PointBuilder().build(0, 0),
            genderDesire: EGender.WOMAN,
            gender: EGender.MAN,
            approachChoice: EApproachChoice.APPROACH,
            birthDay: new Date("1996-09-21"),
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
        it("Should only find users that are the right gender", async () => {
            const userId = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });
            const userId2 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            await userFactory.persistNewTestUser({
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
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
        it("Should only find users that are live", async () => {
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
        it("Should only find users that are verified", async () => {
            await userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.PENDING,
            });

            await userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.NOT_NEEDED,
            });

            const user = await userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.VERIFIED,
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
        it("Should only find users that want to be approached", async () => {
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
        it("Should not find users that are ghost", async () => {
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
    });

    describe("should test users within blacklisted regions", () => {
        it.failing(
            "should not return a match for a blacklisted region",
            async () => {
                /** @DEV random user sitting at home (in blacklisted region) */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(0, 0),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(0, 0))
                            .withRadius(10000)
                            .build(),
                    ],
                });

                /** @DEV random user in another town */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(100, 100),
                });

                const matches =
                    await matchingService.findNearbyMatches(testingMainUser);

                expect(matches.length).toEqual(0);
            },
        );
        it.failing(
            "should return nearby users that are NOT in their blacklisted regions",
            async () => {
                /** @DEV user not in his blacklisted region, but nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(25, 25))
                            .withRadius(100)
                            .build(),
                    ],
                });

                /** @DEV user not in his blacklisted region, but nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(25, 25))
                            .build(),
                    ],
                });

                /** @DEV user not in his blacklisted region, but nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(10, 10))
                            .withRadius(1000)
                            .build(),
                    ],
                });

                expect(
                    (await matchingService.findNearbyMatches(testingMainUser))
                        .length,
                ).toEqual(3);
            },
        );
        it.failing(
            "should return users not in their blacklisted regions",
            async () => {
                /** @DEV manipulate active user */
                const testUser = await userFactory.updateTestUser({
                    location: new PointBuilder().build(10, 10),
                });

                /** @DEV user not in his blacklisted region, but nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(10, 10))
                            .build(),
                    ],
                });

                /** @DEV user not in his blacklisted region, but nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(11, 11))
                            .build(),
                    ],
                });

                /** @DEV user IN his blacklisted region, AND nearby */
                await userFactory.persistNewTestUser({
                    location: new PointBuilder().build(10, 10),
                    blacklistedRegions: [
                        new BlacklistedRegionBuilder()
                            .withLocation(new PointBuilder().build(10, 10))
                            .withRadius(10000)
                            .build(),
                    ],
                });

                expect(
                    (await matchingService.findNearbyMatches(testUser)).length,
                ).toEqual(2);
            },
        );
    });

    describe("should test heatmap-match algorithm", () => {
        it("Should only find users that are the right gender", async () => {
            await userFactory.persistNewTestUser({
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
            });

            const userId2 = await userFactory.persistNewTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId2.id]),
            );
            expect(matches.length).toBe(1);
        });
        it("Should only find users that are live", async () => {
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
        it("Should only find users in the right age span", async () => {
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
        it("Should not find users that are ghost", async () => {
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
        /** @DEV Once we introduce that users can configures this, ensure that this value comes from the user object.
         *  @DEV A failing test will indicate this regardless. */
        const maxDistUser = 1500;
        const DPM = 1 / 111139; // degress per meter

        it("Should not consider users locations for heatmap", async () => {
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

        it("Should consider users locations for nearby-matches", async () => {
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

        it("Should consider precise distance cases for nearby-matches within maxDistUser", async () => {
            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                genderDesire: EGender.WOMAN,
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
    });

    describe("should test users within approach time", () => {});
});
