import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { GenericApiStatusDTO } from "@/DTOs/generic-api-status.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { OBaseNewMatchNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { ELanguage } from "@/types/user.types";
import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { Expo, ExpoPushTicket } from "expo-server-sdk";
import { I18nService } from "nestjs-i18n";

export enum NotificationType {
    NEW_MATCH,
    NEW_EVENT,
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

    async createNewEvent(newEvent: NewEventDTO): Promise<GenericApiStatusDTO> {
        try {
            const notifications: OfflineryNotification[] = [];
            const users = await this.userService.findAll(); // TODO!!!!

            for (const user of users) {
                const userLanguage = user.preferredLanguage ?? ELanguage.en;
                const eventTitle: string = newEvent.eventTitle[userLanguage];
                const eventDescription: string =
                    newEvent.eventDescription[userLanguage];

                notifications.push({
                    sound: "default" as const,
                    title: eventTitle,
                    body: eventDescription,
                    to: user.pushToken,
                    data: {
                        screen: EAppScreens.NEW_EVENT,
                    },
                });
            }

            await this.sendPushNotifications(notifications);
        } catch (err) {
            throw new InternalServerErrorException(err);
        }

        return { requestSuccessful: true };
    }

    async buildNewMatchBaseNotification(
        userSendingLocationUpdate: User,
    ): Promise<OBaseNewMatchNotification> {
        const userLanguage =
            userSendingLocationUpdate.preferredLanguage ?? "en";

        return {
            sound: "default" as const,
            title: await this.i18n.translate(
                "main.notification.newMatch.title",
                {
                    args: {
                        firstName: userSendingLocationUpdate.firstName,
                    },
                    lang: userLanguage,
                },
            ),
            body: this.i18n.translate("main.notification.newMatch.body", {
                lang: userLanguage,
            }),
            data: {
                screen: EAppScreens.NAVIGATE_TO_APPROACH,
            },
        };
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotifications(messages: OfflineryNotification[]) {
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
