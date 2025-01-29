import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { OBaseNewMatchNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Expo, ExpoPushTicket } from "expo-server-sdk";
import { I18nService } from "nestjs-i18n";

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

    async buildNewMatchBaseNotification(
        user: User,
    ): Promise<OBaseNewMatchNotification> {
        const userLanguage = user.preferredLanguage ?? "en";

        return {
            sound: "default" as const,
            title: await this.i18n.translate(
                "main.notification.newMatch.title",
                {
                    args: {
                        firstName: user.firstName,
                    },
                    lang: userLanguage,
                },
            ),
            body: this.i18n.translate("main.notification.newMatch.body", {
                lang: userLanguage,
                args: {
                    firstName: user.firstName,
                },
            }),
            data: {
                type: ENotificationType.NEW_MATCH,
                screen: EAppScreens.NAVIGATE_TO_APPROACH,
            },
        };
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotifications(messages: OfflineryNotification[]) {
        this.logger.debug(
            `Preparing to send push notifications, received base notifications: ${JSON.stringify(messages)}`,
        );
        const validatedNotifications = this.getValidatedNotifications(messages);
        const tickets: ExpoPushTicket[] = [];
        try {
            const chunks = this.expo.chunkPushNotifications(
                validatedNotifications,
            );
            for (const chunk of chunks) {
                try {
                    const ticketChunk =
                        await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    this.logger.error(error);
                }
            }

            this.logger.debug(
                `Shoud have processed ${messages.length} notifications.`,
            );
            this.logger.debug(
                `Processed ${tickets.length} notifications with outcome: ${JSON.stringify(tickets.map((b) => b.status))}`,
            );
        } catch (error) {
            this.logger.error(error);
        }
        this.logger.debug(`Sent ${tickets.length} notifications.`);
        return tickets;
    }

    /**
     * Adapt over time, but before we send out notifications, we should be really sure they're as intended
     * @param notifications
     */
    getValidatedNotifications(notifications: OfflineryNotification[]) {
        return notifications.filter((message) => {
            if (!message.to) {
                this.logger.debug(
                    `Missing token (message.to is ${message.to})`,
                );
                return false;
            }

            if (typeof message.to !== "string" || !message.to) {
                this.logger.debug(
                    `Invalid token type: ${typeof message.to} or empty`,
                );
                return false;
            }

            const isValidStructure =
                message.to.startsWith("ExponentPushToken[") ||
                message.to.startsWith("ExpoPushToken[");

            if (!isValidStructure) {
                this.logger.debug(`Invalid token structure: ${message.to}`);
                return false;
            }

            return true;
        });
    }
}
