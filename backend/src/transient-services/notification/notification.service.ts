import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Expo, ExpoPushTicket, ExpoPushToken } from "expo-server-sdk";
import { StorePushTokenDTO } from "../../DTOs/store-push-token.dto";
import { UserService } from "../../user/user.service";
import { OfflineryNotification } from "./notification-message.type";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private expo: Expo;

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        this.expo = new Expo();
    }

    async storePushToken(userId: string, storePushTokenDTO: StorePushTokenDTO) {
        return await this.userService.updatePushToken(
            userId,
            storePushTokenDTO.pushToken,
        );
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotification(
        pushToken: ExpoPushToken,
        messages: OfflineryNotification[],
    ) {
        // TODO: ensure messages and pushToken are the same, maybe have some wrapper functions or whatever, or load directly from userEntity, etc.
        if (!Expo.isExpoPushToken(pushToken)) {
            this.logger.error(
                `Push token ${pushToken} is not a valid Expo push token`,
            );
            return [];
        }

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
        return tickets;
    }
}
