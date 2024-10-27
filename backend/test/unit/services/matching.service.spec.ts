import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EDateMode, EEncounterStatus } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { EncounterBuilder } from "../../_src/builders/encounter.builder";
import { UserBuilder } from "../../_src/builders/user.builder";

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

            await matchingService.notifyMatches(user);

            expect(
                notificationService.sendPushNotification,
            ).not.toHaveBeenCalled();
            expect(
                encounterService.saveEncountersForUser,
            ).not.toHaveBeenCalled();
        });

        it("should send notifications and save encounters for nearby matches", async () => {
            /** @DEV the users' encounters */
            const usersEncounters = [
                new EncounterBuilder()
                    .withId("100")
                    .withStatus(EEncounterStatus.NOT_MET)
                    .build(),
                new EncounterBuilder()
                    .withId("200")
                    .withStatus(EEncounterStatus.NOT_MET)
                    .build(),
            ];

            /** @DEV the current user with his recent encounters */
            const testingUser = new UserBuilder()
                .withPushToken("TEST-MAIN-USER")
                .withEncounters(usersEncounters)
                .build();

            /** @DEV one of the 5 users he already encountered is currently nearby */
            const potentialMatchThatIsNearby = [
                new UserBuilder()
                    .withId("100")
                    .withPushToken("push-token-1")
                    .build(),
            ];

            jest.spyOn(
                userRepository,
                "getPotentialMatchesForNotifications",
            ).mockResolvedValue(potentialMatchThatIsNearby);

            jest.spyOn(
                encounterService,
                "saveEncountersForUser",
            ).mockResolvedValue(
                new Map([[usersEncounters[0].id, usersEncounters[0]]]),
            );

            i18nService.t.mockImplementation((key) => `Translated ${key}`);

            await matchingService.notifyMatches(testingUser);

            expect(
                notificationService.sendPushNotification,
            ).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ to: "TEST-MAIN-USER" }),
                ]),
            );

            expect(encounterService.saveEncountersForUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "00000000-0000-0000-0000-000000000000",
                    encounters: expect.arrayContaining([
                        expect.objectContaining({ id: "100" }),
                    ]),
                }),
                expect.arrayContaining([
                    expect.objectContaining({
                        id: "100",
                        pushToken: "push-token-1",
                    }),
                ]),
                true,
                true,
            );
        });

        it("should create correct notification object", async () => {
            /** @DEV the users' encounters */
            const usersEncounters = [
                new EncounterBuilder().withId("100").build(),
                new EncounterBuilder().withId("200").build(),
                new EncounterBuilder().withId("300").build(),
                new EncounterBuilder().withId("400").build(),
                new EncounterBuilder().withId("500").build(),
            ];

            /** @DEV the current user with his recent encounters */
            const testingUser = new UserBuilder()
                .withPushToken("TESTING-USER-PUSH-TOKEN")
                .withEncounters(usersEncounters)
                .build();

            /** @DEV one of the 5 users he already encountered is currently nearby */
            const potentialMatchThatIsNearby = [
                new UserBuilder()
                    .withId("100")
                    .withPushToken("push-token-1000")
                    .build(),
            ];

            jest.spyOn(
                userRepository,
                "getPotentialMatchesForNotifications",
            ).mockResolvedValue(potentialMatchThatIsNearby);

            jest.spyOn(
                encounterService,
                "saveEncountersForUser",
            ).mockResolvedValue(
                new Map([[usersEncounters[0].id, usersEncounters[0]]]),
            );

            console.log(
                "mockedData: ",
                new Map([[usersEncounters[0].id, usersEncounters[0]]]),
            );

            i18nService.t.mockImplementation((key) => `Translated ${key}`);

            // ACT
            await matchingService.notifyMatches(testingUser);

            const expectedNotification: OfflineryNotification = {
                to: "TESTING-USER-PUSH-TOKEN",
                sound: "default",
                title: "Translated main.notification.newMatch.title",
                body: "Translated main.notification.newMatch.body",
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: expect.objectContaining({
                        id: expect.any(String),
                        firstName: expect.any(String),
                        age: expect.any(Number),
                        bio: expect.any(String),
                        imageURIs: expect.any(Array),
                        trustScore: expect.any(Number),
                    }),
                    encounterId: undefined,
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
