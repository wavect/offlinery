import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { NewEventResponseDTO } from "@/DTOs/new-event-response.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { OBaseNewMatchNotification } from "@/transient-services/matching/matching.service.types";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { ELanguage } from "@/types/user.types";
import { countExpoPushTicketStatuses } from "@/utils/misc.utils";
import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
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

    async createNewEvent(newEvent: NewEventDTO): Promise<NewEventResponseDTO> {
        let responseDTO: NewEventResponseDTO = {
            error: 0,
            noPushToken: 0,
            ok: 0,
            total: 0,
        };

        try {
            const notifications: OfflineryNotification[] = [];
            const users = await this.userService.findAll(); // TODO!!!!

            for (const user of users) {
                if (!user.pushToken) {
                    this.logger.warn(
                        `No Push token available for user ${user.id}. Skipping in event.`,
                    );
                    responseDTO.total++;
                    responseDTO.noPushToken++;
                    continue;
                }
                const userLanguage = user.preferredLanguage ?? ELanguage.en;
                // @dev DTO enforces definition of all languages otherwise we will need to add an check here if this changes
                const eventTitle: string = newEvent.eventTitle[userLanguage];
                const eventDescription: string =
                    newEvent.eventDescription[userLanguage];

                notifications.push({
                    sound: "default" as const,
                    title: eventTitle,
                    body: eventDescription,
                    to: user.pushToken,
                    data: {
                        type: ENotificationType.NEW_EVENT,
                        screen: EAppScreens.NEW_EVENT,
                    },
                });
            }

            const expoPushTickets =
                await this.sendPushNotifications(notifications);

            responseDTO = {
                ...responseDTO,
                ...(await countExpoPushTicketStatuses(expoPushTickets)),
            };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }

        return responseDTO;
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
                type: ENotificationType.NEW_MATCH,
                screen: EAppScreens.NAVIGATE_TO_APPROACH,
            },
        };
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotifications(messages: OfflineryNotification[]) {
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
            if (!message.to || !this.isValidExpoPushToken(message.to)) {
                this.logger.debug(
                    `Invalid push token detected,  unable to process: ${message.to}`,
                );
                return false;
            }
            return true;
        });
    }

    private isValidExpoPushToken(token: unknown) {
        if (typeof token !== "string") {
            return false;
        }

        return (
            token.startsWith("ExponentPushToken[") ||
            token.startsWith("ExpoPushToken[")
        );
    }
}
