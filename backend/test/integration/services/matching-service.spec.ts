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
        const { module, dataSource, mainUser, factories } =
            await getIntegrationTestModule();
        testingMainUser = mainUser;
        testingModule = module;
        testingDataSource = dataSource;

        matchingService = module.get(MatchingService);
        userFactory = factories.get("user") as UserFactory;

        expect(testingMainUser).toBeDefined();
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
        await userFactory.createMainAppUser();
    });

    describe("should check edge cases prior to retrieving users", () => {
        it("should not fetch notification matches if the user is not live", async () => {
            const userToBeApproached = await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });

            expect(
                await matchingService.findNearbyMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch notification matches if the user has no locations", async () => {
            const userToBeApproached = await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
                location: null,
            });

            expect(
                await matchingService.findNearbyMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch heatmap locations if the user is not live", async () => {
            const userToBeApproached = await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
                location: null,
            });

            expect(
                await matchingService.findHeatmapMatches(userToBeApproached),
            ).toEqual([]);
        });
        it("should not fetch heatmap matches if the user has no locations", async () => {
            const userToBeApproached = await userFactory.persistTestUser({
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
            const userId = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });
            const userId2 = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            await userFactory.persistTestUser({
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
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
        it("Should only find users that are verified", async () => {
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
                    await matchingService.findNearbyMatches(testingMainUser)
                ).values(),
            );

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
        it("Should only find users that want to be approached", async () => {
            const user1 = await userFactory.persistTestUser({
                approachChoice: EApproachChoice.BE_APPROACHED,
            });
            const user2 = await userFactory.persistTestUser({
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
            await userFactory.persistTestUser({
                dateMode: EDateMode.GHOST,
            });
            await userFactory.persistTestUser({
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

    describe("should ignore blacklisted regions", () => {
        it("should not return a match for a blacklisted region", async () => {
            const testUser = await userFactory.persistTestUser({
                dateMode: EDateMode.LIVE,
                verificationStatus: EVerificationStatus.VERIFIED,
                location: new PointBuilder().build(1, 1),
            });

            await userFactory.persistTestUser({
                verificationStatus: EVerificationStatus.VERIFIED,
                blacklistedRegions: [
                    new BlacklistedRegionBuilder()
                        .withLocation(new PointBuilder().build(10, 10))
                        .build(),
                ],
            });

            const matches = await matchingService.findHeatmapMatches(testUser);

            expect(matches.length).toEqual(0);
        });
    });

    describe("should test heatmap-match algorithm", () => {
        it("Should only find users that are the right gender", async () => {
            await userFactory.persistTestUser({
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
            });

            const userId2 = await userFactory.persistTestUser({
                gender: EGender.WOMAN,
                genderDesire: EGender.MAN,
            });

            const matches =
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId2.id]),
            );
        });
        it("Should only find users that are live", async () => {
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
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.length).toBe(3);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([userId.id, userId2.id]),
            );
        });
        it("Should not find users that are ghost", async () => {
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
                await matchingService.findHeatmapMatches(testingMainUser);

            expect(matches.length).toBe(1);
            expect(matches.map((m) => m.id)).toEqual(
                expect.arrayContaining([user.id]),
            );
        });
    });
});
