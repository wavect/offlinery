import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EDateMode } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";

describe("MatchingService", () => {
    let matchingService: MatchingService;
    let userRepository: jest.Mocked<UserRepository>;
    let notificationService: jest.Mocked<NotificationService>;
    let encounterService: jest.Mocked<EncounterService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        getPotentialMatchesForNotifications: jest.fn(),
                        getPotentialMatchesForHeatMap: jest.fn(),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendPushNotification: jest.fn(),
                    },
                },
                {
                    provide: EncounterService,
                    useValue: {
                        saveEncountersForUser: jest.fn(),
                    },
                },
            ],
        }).compile();

        matchingService = module.get<MatchingService>(MatchingService);
        userRepository = module.get(
            UserRepository,
        ) as jest.Mocked<UserRepository>;
        notificationService = module.get(
            NotificationService,
        ) as jest.Mocked<NotificationService>;
        encounterService = module.get(
            EncounterService,
        ) as jest.Mocked<EncounterService>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findNearbyMatches", () => {
        it("should return an empty array if user is not sharing location", async () => {
            const user = new User();
            user.dateMode = EDateMode.GHOST;

            const result = await matchingService.findHeatmapMatches(user);

            expect(result).toEqual([]);
        });

        it("should call getPotentialMatchesForHeatMap when enableEnableExtendedChecksForNotification is false", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };

            userRepository.getPotentialMatchesForHeatMap.mockResolvedValue([
                new User(),
                new User(),
            ]);

            const result = await matchingService.findHeatmapMatches(user);

            expect(result).toHaveLength(2);
        });
    });

    describe("checkAndNotifyMatches", () => {
        it("should not send notifications or save encounters if no nearby matches", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };

            jest.spyOn(matchingService, "findHeatmapMatches").mockResolvedValue(
                [],
            );

            await matchingService.checkForEncounters(user);

            expect(
                notificationService.sendPushNotifications,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });
    });
});
