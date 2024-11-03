import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { OBaseNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Expo, ExpoPushTicket } from "expo-server-sdk";
import { I18nService } from "nestjs-i18n";

export enum NotificationType {
    NEW_MATCH,
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private expo: Expo;

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly i18n: I18nService<I18nTranslations>,
    ) {
        this.expo = new Expo();
    }

    async storePushToken(userId: string, storePushTokenDTO: StorePushTokenDTO) {
        return await this.userService.updatePushToken(
            userId,
            storePushTokenDTO.pushToken,
        );
    }

    async buildBaseNotification(
        userSendingLocationUpdate: User,
        type: NotificationType,
    ): Promise<OBaseNotification> {
        const userLanguage =
            userSendingLocationUpdate.preferredLanguage ?? "en";
        const notificationContent =
            await this.getNotificationOptionByType(type);
        return {
            sound: notificationContent.sound,
            title: await this.i18n.translate(notificationContent.title, {
                args: {
                    firstName: userSendingLocationUpdate.firstName,
                },
                lang: userLanguage,
            }),
            body: this.i18n.translate(notificationContent.body, {
                lang: userLanguage,
            }),
            data: {
                screen: notificationContent.screen,
                navigateToPerson:
                    userSendingLocationUpdate.convertToPublicDTO(),
            },
        };
    }

    async getNotificationOptionByType(notificationType: NotificationType) {
        switch (notificationType) {
            case NotificationType.NEW_MATCH:
                return {
                    sound: "default" as const,
                    title: "main.notification.newMatch.title" as const,
                    body: "main.notification.newMatch.body" as const,
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                };
            default: {
                return null;
            }
        }
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotification(messages: OfflineryNotification[]) {
        const tickets: ExpoPushTicket[] = [];
        try {
            const chunks = this.expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const ticketChunk =
                        await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    this.logger.error(error);
                }
            }
        } catch (error) {
            this.logger.error(error);
        }
        this.logger.debug(`Sent ${tickets.length} notifications.`);
        return tickets;
    }
}
