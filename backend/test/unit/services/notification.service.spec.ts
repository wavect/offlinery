import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { NotificationNewEventDTO } from "@/DTOs/notifications/notification-new-event.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Expo, ExpoPushTicket } from "expo-server-sdk";
import { I18nService } from "nestjs-i18n";
import { UserBuilder } from "../../_src/builders/user.builder";

describe("NotificationService", () => {
    let notificationService: NotificationService;
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

        notificationService =
            module.get<NotificationService>(NotificationService);
        (notificationService as any).expo = mockExpo;
        (notificationService as any).logger = mockLogger;
    });

    describe("getValidatedNotifications", () => {
        it("should filter out notifications with invalid push tokens", () => {
            const validNotification1: OfflineryNotification = {
                to: "ExpoPushToken[",
                data: {
                    type: ENotificationType.NEW_EVENT,
                    screen: EAppScreens.NEW_EVENT,
                } as NotificationNewEventDTO,
            };

            const validNotification2: OfflineryNotification = {
                to: "ExponentPushToken[",
                data: {
                    type: ENotificationType.NEW_MATCH,
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: {} as UserPublicDTO,
                    encounterId: "123",
                } as NotificationNavigateUserDTO,
            };

            const invalidNotification: OfflineryNotification = {
                to: "invalidToken",
                data: {
                    type: ENotificationType.NEW_EVENT,
                    screen: EAppScreens.NEW_EVENT,
                } as NotificationNewEventDTO,
            };

            const notifications = [
                validNotification1,
                invalidNotification,
                validNotification2,
            ];

            const result =
                notificationService.getValidatedNotifications(notifications);

            expect(result).toHaveLength(2);
            expect(result).toContainEqual(validNotification1);
            expect(result).toContainEqual(validNotification2);
            expect(result).not.toContainEqual(invalidNotification);
        });

        it("should filter out notifications with null or undefined tokens", () => {
            const validNotification: OfflineryNotification = {
                to: "ExpoPushToken[valid]",
                data: {} as NotificationNewEventDTO,
            };

            const nullTokenNotification: OfflineryNotification = {
                to: null as unknown as string,
                data: {} as NotificationNewEventDTO,
            };

            const undefinedTokenNotification: OfflineryNotification = {
                to: undefined as unknown as string,
                data: {} as NotificationNewEventDTO,
            };

            const notifications = [
                validNotification,
                nullTokenNotification,
                undefinedTokenNotification,
            ];

            const result =
                notificationService.getValidatedNotifications(notifications);

            expect(result).toHaveLength(1);
            expect(result).toContainEqual(validNotification);
        });

        it("should return empty array for empty input", () => {
            const result = notificationService.getValidatedNotifications([]);
            expect(result).toHaveLength(0);
        });
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

            const result =
                await notificationService.sendPushNotifications(messages);

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

            const result =
                await notificationService.sendPushNotifications(messages);

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

            const result =
                await notificationService.sendPushNotifications(messages);

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
