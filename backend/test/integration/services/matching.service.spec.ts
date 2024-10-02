import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EDateMode } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";

describe("MatchingService Integration", () => {
    let matchingService: MatchingService;

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
    });

    describe("findNearbyMatches: execution path is correct, depending on the enableExtendedChecks flag", () => {
        it("should return an empty array when user is not sharing location", async () => {
            const user = new User();
            user.dateMode = EDateMode.GHOST;

            const result =
                await matchingService.findPotentialMatchesForHeatmap(user);

            expect(result).toEqual([]);
        });
    });
});
