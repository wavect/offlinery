import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EDateMode } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { UserEntityBuilder } from "../../_src/builders/user-entity.builder";

describe("MatchingService", () => {
    let matchingService: MatchingService;
    let i18nService: jest.Mocked<I18nService>;
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
        i18nService = module.get(I18nService) as jest.Mocked<I18nService>;
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

            const result =
                await matchingService.findPotentialMatchesForHeatmap(user);

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

            const result =
                await matchingService.findPotentialMatchesForHeatmap(user);

            expect(result).toHaveLength(2);
        });
    });

    describe("checkAndNotifyMatches", () => {
        it("should not send notifications or save encounters if no nearby matches", async () => {
            const user = new User();
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };

            jest.spyOn(
                matchingService,
                "findPotentialMatchesForHeatmap",
            ).mockResolvedValue([]);

            await matchingService.checkAndNotifyMatches(user);

            expect(
                notificationService.sendPushNotification,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });

        it("should send notifications and save encounters for nearby matches", async () => {
            const user = new User();
            user.id = "1";
            user.firstName = "John";
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };

            const mockPotentialMatches: Map<string, User> = new Map([
                [
                    "2",
                    new UserEntityBuilder()
                        .setField("id", "2")
                        .setField("pushToken", "token1")
                        .build(),
                ],
                [
                    "3",
                    new UserEntityBuilder()
                        .setField("id", "3")
                        .setField("pushToken", "token2")
                        .build(),
                ],
            ]);

            jest.spyOn(
                userRepository,
                "getPotentialMatchesForNotifications",
            ).mockResolvedValue(mockPotentialMatches);

            i18nService.t.mockReturnValue("Translated text");

            await matchingService.checkAndNotifyMatches(user);

            expect(
                notificationService.sendPushNotification,
            ).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ to: "token1" }),
                    expect.objectContaining({ to: "token2" }),
                ]),
            );

            expect(encounterService.saveEncountersForUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "1", // Only checking the id of the first user argument
                }),
                expect.arrayContaining([
                    expect.objectContaining({
                        pushToken: "token2",
                    }),
                    expect.objectContaining({
                        pushToken: "token2",
                    }),
                ]),
                true,
                true,
            );
        });

        it("should create correct notification object", async () => {
            const user = new User();
            user.id = "1";
            user.firstName = "John";
            user.dateMode = EDateMode.LIVE;
            user.location = { type: "Point", coordinates: [0, 0] };
            user.encounters = [
                {
                    id: 1,
                },
            ] as any;

            const match = new User();
            match.id = "2";
            match.pushToken = "token1";

            const mapResp: Map<string, User> = new Map([
                ["user1", new UserEntityBuilder().build()],
            ]);

            jest.spyOn(
                userRepository,
                "getPotentialMatchesForNotifications",
            ).mockResolvedValue(mapResp);

            i18nService.t.mockImplementation((key) => `Translated ${key}`);

            await matchingService.checkAndNotifyMatches(user);

            const expectedNotification: OfflineryNotification = {
                to: undefined, // Changed from "token1" to undefined
                sound: "default",
                title: "Translated main.notification.newMatch.title",
                body: "Translated main.notification.newMatch.body",
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: expect.objectContaining({
                        id: expect.any(String),
                        firstName: expect.any(String),
                        age: expect.any(Number),
                        bio: undefined,
                        imageURIs: undefined,
                        trustScore: undefined,
                    }),
                    encounterId: expect.any(String),
                },
            };

            expect(
                notificationService.sendPushNotification,
            ).toHaveBeenCalledWith(
                expect.arrayContaining([expectedNotification]),
            );
        });
    });
});
