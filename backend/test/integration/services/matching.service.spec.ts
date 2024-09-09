import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EDateMode } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { Point } from "geojson";
import { I18nService } from "nestjs-i18n";

describe("MatchingService Integration", () => {
    let matchingService: MatchingService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchingService,
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
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn(),
                    },
                },
            ],
        }).compile();

        matchingService = module.get<MatchingService>(MatchingService);
        userRepository = module.get<UserRepository>(UserRepository);
        notificationService =
            module.get<NotificationService>(NotificationService);
        encounterService = module.get<EncounterService>(EncounterService);
        i18nService = module.get<I18nService>(I18nService);
    });

    describe("findNearbyMatches: execution path is correct, depending on the enableExtendedChecks flag", () => {
        it("should return an empty array when user is not sharing location", async () => {
            const user = new User();
            user.dateMode = EDateMode.GHOST;

            const result = await matchingService.findNearbyMatches(user);

            expect(result).toEqual([]);
        });

        it("should call getPotentialMatchesForNotifications when enableExtendedChecks is true", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] } as Point;

            await matchingService.findNearbyMatches(user, true);

            expect(
                userRepository.getPotentialMatchesForNotifications,
            ).toHaveBeenCalledWith(user);
        });

        it("should call getPotentialMatchesForHeatMap when enableExtendedChecks is false", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] } as Point;

            await matchingService.findNearbyMatches(user, false);

            expect(
                userRepository.getPotentialMatchesForHeatMap,
            ).toHaveBeenCalledWith(user);
        });
    });
});
