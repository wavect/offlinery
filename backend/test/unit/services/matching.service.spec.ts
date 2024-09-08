import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { DataSource, Repository } from "typeorm";
import { BlacklistedRegion } from "../../../src/entities/blacklisted-region/blacklisted-region.entity";
import { EncounterService } from "../../../src/entities/encounter/encounter.service";
import { User } from "../../../src/entities/user/user.entity";
import { MatchingService } from "../../../src/transient-services/matching/matching.service";
import { NotificationService } from "../../../src/transient-services/notification/notification.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "../../../src/types/user.types";

jest.mock("geo-tz", () => ({
    find: jest.fn().mockReturnValue(["America/New_York"]),
}));

describe("MatchingService", () => {
    let matchingService: MatchingService;
    let encounterService: EncounterService;
    let notificationService: NotificationService;
    let userRepository: Repository<User>;
    let blacklistedRegionRepository: Repository<BlacklistedRegion>;

    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn().mockReturnValue("Translated text"),
                    },
                },
                {
                    provide: EncounterService,
                    useValue: {
                        saveEncountersForUser: jest.fn(),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendPushNotification: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        createQueryBuilder: jest
                            .fn()
                            .mockReturnValue(mockQueryBuilder),
                    },
                },
                {
                    provide: getRepositoryToken(BlacklistedRegion),
                    useValue: {
                        createQueryBuilder: jest
                            .fn()
                            .mockReturnValue(mockQueryBuilder),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {},
                },
            ],
        }).compile();

        matchingService = module.get<MatchingService>(MatchingService);
        encounterService = module.get<EncounterService>(EncounterService);
        notificationService =
            module.get<NotificationService>(NotificationService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        blacklistedRegionRepository = module.get<Repository<BlacklistedRegion>>(
            getRepositoryToken(BlacklistedRegion),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("checkAndNotifyMatches", () => {
        it("should not notify when no matches are found", async () => {
            const userToBeApproached = new User();
            userToBeApproached.id = "1";
            userToBeApproached.dateMode = EDateMode.LIVE;
            userToBeApproached.location = {
                type: "Point",
                coordinates: [0, 0],
            };
            userToBeApproached.approachFromTime = new Date();
            userToBeApproached.approachToTime = new Date();

            jest.spyOn(
                matchingService as any,
                "findNearbyMatches",
            ).mockResolvedValue([]);

            await matchingService.checkAndNotifyMatches(userToBeApproached);

            expect(
                notificationService.sendPushNotification,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });

        it("should notify and save encounters when matches are found", async () => {
            const userToBeApproached = new User();
            userToBeApproached.id = "1";
            userToBeApproached.dateMode = EDateMode.LIVE;
            userToBeApproached.location = {
                type: "Point",
                coordinates: [0, 0],
            };
            userToBeApproached.approachFromTime = new Date();
            userToBeApproached.approachToTime = new Date();
            userToBeApproached.firstName = "John";

            const matchedUser = new User();
            matchedUser.id = "2";
            matchedUser.pushToken = "token123";

            jest.spyOn(
                matchingService as any,
                "findNearbyMatches",
            ).mockResolvedValue([matchedUser]);

            await matchingService.checkAndNotifyMatches(userToBeApproached);

            expect(
                notificationService.sendPushNotification,
            ).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        to: "token123",
                        title: "Translated text",
                        body: "Translated text",
                    }),
                ]),
            );
            expect(encounterService.saveEncountersForUser).toHaveBeenCalledWith(
                userToBeApproached,
                [matchedUser],
                true,
                true,
            );
        });
    });

    describe("findNearbyMatches", () => {
        let user: User;

        beforeEach(() => {
            user = new User();
            user.id = "1";
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };
            user.approachFromTime = new Date();
            user.approachToTime = new Date(Date.now() + 3600000); // 1 hour from now
            user.birthDay = new Date("1990-01-01");
            user.gender = EGender.MAN;
            user.genderDesire = EGender.WOMAN;

            jest.spyOn(
                matchingService as any,
                "isWithinApproachTime",
            ).mockReturnValue(true);
        });

        it("should return empty array when user is not in LIVE mode", async () => {
            user.dateMode = EDateMode.GHOST;
            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should return empty array when user has no location", async () => {
            user.location = null;
            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should return empty array when user is in a blacklisted region", async () => {
            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(1),
            } as any);

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should return empty array when not within approach time", async () => {
            jest.spyOn(matchingService, "isWithinApproachTime").mockReturnValue(
                false,
            );

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should return matches when all conditions are met", async () => {
            const matchedUser = new User();
            matchedUser.id = "2";
            matchedUser.gender = EGender.WOMAN;
            matchedUser.genderDesire = EGender.MAN;
            matchedUser.verificationStatus = EVerificationStatus.VERIFIED;
            matchedUser.dateMode = EDateMode.LIVE;
            matchedUser.approachChoice = EApproachChoice.APPROACH;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([matchedUser]),
            } as any);

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([matchedUser]);
        });

        it("should not return users with mismatched gender preferences", async () => {
            const mismatchedUser = new User();
            mismatchedUser.id = "2";
            mismatchedUser.gender = EGender.MAN;
            mismatchedUser.genderDesire = EGender.WOMAN;
            mismatchedUser.verificationStatus = EVerificationStatus.VERIFIED;
            mismatchedUser.dateMode = EDateMode.LIVE;
            mismatchedUser.approachChoice = EApproachChoice.APPROACH;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should not return unverified users", async () => {
            const unverifiedUser = new User();
            unverifiedUser.id = "2";
            unverifiedUser.gender = EGender.WOMAN;
            unverifiedUser.genderDesire = EGender.MAN;
            unverifiedUser.verificationStatus = EVerificationStatus.PENDING;
            unverifiedUser.dateMode = EDateMode.LIVE;
            unverifiedUser.approachChoice = EApproachChoice.APPROACH;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should not return users who are not in LIVE mode", async () => {
            const ghostUser = new User();
            ghostUser.id = "2";
            ghostUser.gender = EGender.WOMAN;
            ghostUser.genderDesire = EGender.MAN;
            ghostUser.verificationStatus = EVerificationStatus.VERIFIED;
            ghostUser.dateMode = EDateMode.GHOST;
            ghostUser.approachChoice = EApproachChoice.APPROACH;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should not return users who don't want to approach", async () => {
            const noApproachUser = new User();
            noApproachUser.id = "2";
            noApproachUser.gender = EGender.WOMAN;
            noApproachUser.genderDesire = EGender.MAN;
            noApproachUser.verificationStatus = EVerificationStatus.VERIFIED;
            noApproachUser.dateMode = EDateMode.LIVE;
            noApproachUser.approachChoice = EApproachChoice.BE_APPROACHED;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );
            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should not return users outside the age range", async () => {
            const olderUser = new User();
            olderUser.id = "2";
            olderUser.gender = EGender.WOMAN;
            olderUser.genderDesire = EGender.MAN;
            olderUser.verificationStatus = EVerificationStatus.VERIFIED;
            olderUser.dateMode = EDateMode.LIVE;
            olderUser.approachChoice = EApproachChoice.APPROACH;
            olderUser.birthDay = new Date("1950-01-01");

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });

        it("should not return users with recent encounters", async () => {
            const recentEncounterUser = new User();
            recentEncounterUser.id = "2";
            recentEncounterUser.gender = EGender.WOMAN;
            recentEncounterUser.genderDesire = EGender.MAN;
            recentEncounterUser.verificationStatus =
                EVerificationStatus.VERIFIED;
            recentEncounterUser.dateMode = EDateMode.LIVE;
            recentEncounterUser.approachChoice = EApproachChoice.APPROACH;

            jest.spyOn(
                blacklistedRegionRepository,
                "createQueryBuilder",
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            } as any);

            jest.spyOn(userRepository, "createQueryBuilder").mockReturnValue(
                mockQueryBuilder as any,
            );

            const result = await matchingService.findNearbyMatches(user);
            expect(result).toEqual([]);
        });
    });

    describe("isWithinApproachTime", () => {
        it("should return true when current time is within approach time range", () => {
            const user = new User();
            user.approachFromTime = new Date("2023-01-01T10:00:00Z");
            user.approachToTime = new Date("2023-01-01T12:00:00Z");

            jest.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
                "1/1/2023, 11:00:00 AM",
            );

            const result = matchingService.isWithinApproachTime(user, 0, 0);

            expect(result).toBe(true);
        });

        it("should return false when current time is outside approach time range", () => {
            const user = new User();
            user.approachFromTime = new Date("2023-01-01T10:00:00Z");
            user.approachToTime = new Date("2023-01-01T12:00:00Z");

            jest.spyOn(Date.prototype, "toLocaleString").mockReturnValue(
                "1/1/2023, 13:00:00 PM",
            );

            const result = matchingService.isWithinApproachTime(user, 0, 0);

            expect(result).toBe(false);
        });

        it("should handle approach time range spanning midnight", () => {
            const user = new User();
            user.approachFromTime = new Date("1970-01-01T22:00:00Z");
            user.approachToTime = new Date("1970-01-02T02:00:00Z");

            const testCases = [
                { time: "1970-01-01T21:59:59Z", expected: false }, // Just before start
                { time: "1970-01-01T22:00:00Z", expected: true }, // At start
                { time: "1970-01-01T23:59:59Z", expected: true }, // Just before midnight
                { time: "1970-01-02T00:00:00Z", expected: true }, // At midnight
                { time: "1970-01-02T01:59:59Z", expected: true }, // Just before end
                { time: "1970-01-02T02:00:00Z", expected: false }, // At end
                { time: "1970-01-02T02:00:01Z", expected: false }, // Just after end
            ];

            testCases.forEach(({ time, expected }) => {
                const currentTime = new Date(time);
                jest.spyOn(
                    matchingService as any,
                    "getCurrentTime",
                ).mockReturnValue(currentTime);
                const result = matchingService.isWithinApproachTime(user, 0, 0);
                expect(result).toBe(expected);
            });
        });

        const testCases = [
            {
                location: "New York",
                coordinates: [40.7128, -74.006],
                timezone: "America/New_York",
                localTimes: [
                    { time: "2023-09-07T08:59:59-04:00", expected: false }, // 12:59 PM UTC, just before start
                    { time: "2023-09-07T09:00:00-04:00", expected: true }, // 1:00 PM UTC, at start
                    { time: "2023-09-07T12:00:00-04:00", expected: true }, // 4:00 PM UTC, middle of range
                    { time: "2023-09-07T14:59:59-04:00", expected: true }, // 6:59 PM UTC, just before end
                    { time: "2023-09-07T15:00:00-04:00", expected: false }, // 7:00 PM UTC, at end
                    { time: "2023-09-07T15:00:01-04:00", expected: false }, // 7:00:01 PM UTC, just after end
                ],
            },
            {
                location: "London",
                coordinates: [51.5074, -0.1278],
                timezone: "Europe/London",
                localTimes: [
                    { time: "2023-09-07T13:59:59+01:00", expected: false }, // 12:59 PM UTC, just before start
                    { time: "2023-09-07T14:00:00+01:00", expected: true }, // 1:00 PM UTC, at start
                    { time: "2023-09-07T17:00:00+01:00", expected: true }, // 4:00 PM UTC, middle of range
                    { time: "2023-09-07T19:59:59+01:00", expected: true }, // 6:59 PM UTC, just before end
                    { time: "2023-09-07T20:00:00+01:00", expected: false }, // 7:00 PM UTC, at end
                    { time: "2023-09-07T20:00:01+01:00", expected: false }, // 7:00:01 PM UTC, just after end
                ],
            },
            {
                location: "Tokyo",
                coordinates: [35.6762, 139.6503],
                timezone: "Asia/Tokyo",
                localTimes: [
                    { time: "2023-09-07T21:59:59+09:00", expected: false }, // 12:59 PM UTC, just before start
                    { time: "2023-09-07T22:00:00+09:00", expected: true }, // 1:00 PM UTC, at start
                    { time: "2023-09-08T01:00:00+09:00", expected: true }, // 4:00 PM UTC, middle of range
                    { time: "2023-09-08T03:59:59+09:00", expected: true }, // 6:59 PM UTC, just before end
                    { time: "2023-09-08T04:00:00+09:00", expected: false }, // 7:00 PM UTC, at end
                    { time: "2023-09-08T04:00:01+09:00", expected: false }, // 7:00:01 PM UTC, just after end
                ],
            },
        ];

        testCases.forEach(({ location, coordinates, timezone, localTimes }) => {
            describe(`Location: ${location} - isWithinApproachTime`, () => {
                let matchingService: MatchingService;
                let user: User;

                beforeEach(() => {
                    matchingService = new MatchingService(
                        null,
                        null,
                        null,
                        null,
                        null,
                    );
                    user = new User();
                    // Set approach time from 1 PM to 7 PM UTC
                    user.approachFromTime = new Date("2023-09-07T13:00:00Z");
                    user.approachToTime = new Date("2023-09-07T19:00:00Z");

                    jest.mock("geo-tz", () => ({
                        find: jest.fn().mockReturnValue([timezone]),
                    }));
                });

                localTimes.forEach(({ time, expected }) => {
                    it(`should return ${expected} at ${time}`, () => {
                        const [lat, lon] = coordinates;
                        const localTime = new Date(time);
                        jest.spyOn(
                            matchingService as any,
                            "getCurrentTime",
                        ).mockReturnValue(localTime);

                        const result = matchingService.isWithinApproachTime(
                            user,
                            lat,
                            lon,
                        );

                        expect(result).toBe(expected);
                    });
                });
            });
        });
    });
});
