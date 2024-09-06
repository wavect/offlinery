import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { BlacklistedRegionModule } from "@/entities/blacklisted-region/blacklisted-region.module";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserReportModule } from "@/entities/user-report/user-report.module";
import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { I18nTranslations } from "@/translations/i18n.generated";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import {
    getDataSourceToken,
    getRepositoryToken,
    TypeOrmModule,
} from "@nestjs/typeorm";
import { I18nModule, I18nService } from "nestjs-i18n";
import * as path from "node:path";
import { DataSource, DataSourceOptions, Repository } from "typeorm";
import { NotificationModule } from "../notification/notification.module";
import { NotificationService } from "../notification/notification.service";
import { MatchingService } from "./matching.service";

jest.mock("geo-tz", () => ({
    find: jest.fn().mockReturnValue(["America/New_York"]),
}));

describe("MatchingService", () => {
    let matchingService: MatchingService;
    let i18nService: I18nService<I18nTranslations>;
    let encounterService: EncounterService;
    let notificationService: NotificationService;
    let userRepository: Repository<User>;
    let blacklistedRegionRepository: Repository<BlacklistedRegion>;

    beforeEach(async () => {
        const mockDataSourceOptions: DataSourceOptions = {
            type: "sqlite",
            database: ":memory:",
            entities: [UserReport],
            synchronize: true,
        };

        const mockDataSource = new DataSource(mockDataSourceOptions);

        const x = path.join(__dirname, "..", "..", "translations");
        console.log("hahawas", x);
        const app: TestingModule = await Test.createTestingModule({
            providers: [MatchingService],
            imports: [
                UserModule,
                UserReportModule,
                BlacklistedRegionModule,
                EncounterModule,
                NotificationModule,
                TypeOrmModule.forRoot(mockDataSourceOptions),
                TypeOrmModule.forFeature([
                    UserReport,
                    User,
                    Encounter,
                    PendingUser,
                    BlacklistedRegion,
                ]),
                I18nModule.forRoot({
                    fallbackLanguage: ELanguage.en,
                    loaderOptions: {
                        path: path.join(__dirname, "..", "..", "translations"),
                        watch: true,
                    },
                }),
            ],
        })
            .overrideProvider(getDataSourceToken())
            .useValue(mockDataSource)
            .compile();

        matchingService = app.get<MatchingService>(MatchingService);
        encounterService = app.get<EncounterService>(EncounterService);
        i18nService = app.get<I18nService<I18nTranslations>>(I18nService);
        notificationService = app.get<NotificationService>(NotificationService);
        userRepository = app.get(getRepositoryToken(User));
        blacklistedRegionRepository = app.get(
            getRepositoryToken(BlacklistedRegion),
        );
    });

    it("should be defined", () => {
        expect(matchingService).toBeDefined();
        expect(i18nService).toBeDefined();
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

            (userRepository.createQueryBuilder as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([matchedUser]),
            });

            //i18nService.t.mockReturnValue("Translated text");

            await matchingService.checkAndNotifyMatches(userToBeApproached);

            expect(
                notificationService.sendPushNotification,
            ).toHaveBeenCalledWith([
                expect.objectContaining({
                    to: "token123",
                    title: "Translated text",
                    body: "Translated text",
                }),
            ]);
            expect(encounterService.saveEncountersForUser).toHaveBeenCalledWith(
                userToBeApproached,
                [matchedUser],
            );
        });

        it("should not notify when user is in a blacklisted region", async () => {
            const userToBeApproached = new User();
            userToBeApproached.id = "1";
            userToBeApproached.dateMode = EDateMode.LIVE;
            userToBeApproached.location = {
                type: "Point",
                coordinates: [0, 0],
            };
            userToBeApproached.approachFromTime = new Date();
            userToBeApproached.approachToTime = new Date();

            (
                blacklistedRegionRepository.createQueryBuilder as jest.Mock
            ).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(1),
            });

            await matchingService.checkAndNotifyMatches(userToBeApproached);

            expect(
                notificationService.sendPushNotification,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });

        it("should not notify when user is not within approach time", async () => {
            const userToBeApproached = new User();
            userToBeApproached.id = "1";
            userToBeApproached.dateMode = EDateMode.LIVE;
            userToBeApproached.location = {
                type: "Point",
                coordinates: [0, 0],
            };
            userToBeApproached.approachFromTime = new Date(
                "2023-01-01T10:00:00Z",
            );
            userToBeApproached.approachToTime = new Date(
                "2023-01-01T11:00:00Z",
            );

            jest.spyOn(Date, "now").mockImplementation(() =>
                new Date("2023-01-01T12:00:00Z").getTime(),
            );

            await matchingService.checkAndNotifyMatches(userToBeApproached);

            expect(
                notificationService.sendPushNotification,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });
    });

    describe("findNearbyMatches", () => {
        it("should return empty array when user is not in LIVE mode", async () => {
            const user = new User();
            user.dateMode = EDateMode.GHOST;
            user.location = { type: "Point", coordinates: [0, 0] };

            const result = await (matchingService as any).findNearbyMatches(
                user,
            );

            expect(result).toEqual([]);
        });

        it("should return empty array when user has no location", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = null;

            const result = await (matchingService as any).findNearbyMatches(
                user,
            );

            expect(result).toEqual([]);
        });

        it("should return matches when all conditions are met", async () => {
            const user = new User();
            user.id = "1";
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };
            user.approachFromTime = new Date();
            user.approachToTime = new Date(Date.now() + 3600000); // 1 hour from now
            user.birthDay = new Date("1990-01-01");
            user.gender = EGender.MAN;
            user.genderDesire = EGender.WOMAN;

            const matchedUser = new User();
            matchedUser.id = "2";
            matchedUser.gender = EGender.WOMAN;
            matchedUser.genderDesire = EGender.MAN;
            matchedUser.verificationStatus = EVerificationStatus.VERIFIED;
            matchedUser.dateMode = EDateMode.LIVE;
            matchedUser.approachChoice = EApproachChoice.APPROACH;

            (userRepository.createQueryBuilder as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([matchedUser]),
            });

            const result = await (matchingService as any).findNearbyMatches(
                user,
            );

            expect(result).toEqual([matchedUser]);
        });
    });

    describe("isWithinApproachTime", () => {
        it("should return true when current time is within approach time range", () => {
            const user = new User();
            user.approachFromTime = new Date("2023-01-01T10:00:00Z");
            user.approachToTime = new Date("2023-01-01T12:00:00Z");

            jest.spyOn(global.Date.prototype, "toLocaleString").mockReturnValue(
                "1/1/2023, 11:00:00 AM",
            );

            const result = (matchingService as any).isWithinApproachTime(
                user,
                0,
                0,
            );

            expect(result).toBe(true);
        });

        it("should return false when current time is outside approach time range", () => {
            const user = new User();
            user.approachFromTime = new Date("2023-01-01T10:00:00Z");
            user.approachToTime = new Date("2023-01-01T12:00:00Z");

            jest.spyOn(Date, "now").mockImplementation(() =>
                new Date("2023-01-01T13:00:00Z").getTime(),
            );

            const result = (matchingService as any).isWithinApproachTime(
                user,
                0,
                0,
            );

            expect(result).toBe(false);
        });

        it("should handle approach time range spanning midnight", () => {
            const user = new User();
            user.approachFromTime = new Date("2023-01-01T22:00:00Z");
            user.approachToTime = new Date("2023-01-02T02:00:00Z");

            jest.spyOn(global.Date.prototype, "toLocaleString").mockReturnValue(
                "1/1/2023, 01:00:00 AM",
            );

            const result = (matchingService as any).isWithinApproachTime(
                user,
                0,
                0,
            );

            expect(result).toBe(true);
        });
    });
});
