import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Expo, ExpoPushTicket } from "expo-server-sdk";
import { I18nService } from "nestjs-i18n";
import { UserBuilder } from "../../_src/builders/user.builder";

describe("NotificationService", () => {
    let service: NotificationService;
    let mockUserService: jest.Mocked<UserService>;
    let mockExpo: jest.Mocked<Expo>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(async () => {
        mockUserService = {
            updatePushToken: jest.fn(),
        } as any;

        mockExpo = {
            chunkPushNotifications: jest.fn(),
            sendPushNotificationsAsync: jest.fn(),
        } as any;

        mockLogger = {
            debug: jest.fn(),
            error: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn(),
                        translate: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        (service as any).expo = mockExpo;
        (service as any).logger = mockLogger;
    });

    describe("sendPushNotification", () => {
        it("should send push notifications successfully", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                    data: {
                        encounterId: "1",
                        navigateToPerson: {
                            ...new UserBuilder().build(),
                            age: 21,
                        },
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        type: ENotificationType.NEW_MATCH,
                    },
                    body: "test message 1",
                },
                {
                    to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                    data: {
                        encounterId: "1",
                        navigateToPerson: {
                            ...new UserBuilder().build(),
                            age: 21,
                        },
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        type: ENotificationType.NEW_MATCH,
                    },
                    body: "test message 1",
                },
            ];

            const mockChunks = [[messages[0]], [messages[1]]];
            mockExpo.chunkPushNotifications.mockReturnValue(mockChunks);

            const mockTickets: ExpoPushTicket[] = [
                { status: "ok", id: "1" },
                { status: "ok", id: "2" },
            ];
            mockExpo.sendPushNotificationsAsync
                .mockResolvedValueOnce([mockTickets[0]])
                .mockResolvedValueOnce([mockTickets[1]]);

            const result = await service.sendPushNotifications(messages);

            expect(mockExpo.chunkPushNotifications).toHaveBeenCalledWith(
                messages,
            );
            expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledTimes(
                2,
            );
            expect(mockExpo.sendPushNotificationsAsync).toHaveBeenNthCalledWith(
                1,
                [messages[0]],
            );
            expect(mockExpo.sendPushNotificationsAsync).toHaveBeenNthCalledWith(
                2,
                [messages[1]],
            );
            expect(result).toEqual(mockTickets);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Sent 2 notifications.",
            );
        });

        it("should handle errors when sending notifications", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                    data: {
                        encounterId: "1",
                        navigateToPerson: {
                            ...new UserBuilder().build(),
                            age: 21,
                        },
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        type: ENotificationType.NEW_MATCH,
                    },
                    body: "test message 1",
                },
            ];

            const mockChunks = [[messages[0]]];
            mockExpo.chunkPushNotifications.mockReturnValue(mockChunks);

            const mockError = new Error("Failed to send notification");
            mockExpo.sendPushNotificationsAsync.mockRejectedValue(mockError);

            const result = await service.sendPushNotifications(messages);

            expect(mockExpo.chunkPushNotifications).toHaveBeenCalledWith(
                messages,
            );
            expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledTimes(
                1,
            );
            expect(mockExpo.sendPushNotificationsAsync).toHaveBeenCalledWith([
                messages[0],
            ]);
            expect(result).toEqual([]);
            expect(mockLogger.error).toHaveBeenCalledWith(mockError);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Sent 0 notifications.",
            );
        });

        it("should handle errors in chunkPushNotifications", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
                    data: {
                        encounterId: "1",
                        navigateToPerson: {
                            ...new UserBuilder().build(),
                            age: 21,
                        },
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        type: ENotificationType.NEW_MATCH,
                    },
                    body: "test message 1",
                },
            ];

            const mockError = new Error("Failed to chunk notifications");
            mockExpo.chunkPushNotifications.mockImplementation(() => {
                throw mockError;
            });

            const result = await service.sendPushNotifications(messages);

            expect(mockExpo.chunkPushNotifications).toHaveBeenCalledWith(
                messages,
            );
            expect(mockExpo.sendPushNotificationsAsync).not.toHaveBeenCalled();
            expect(result).toEqual([]);
            expect(mockLogger.error).toHaveBeenCalledWith(mockError);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Sent 0 notifications.",
            );
        });
    });
});
