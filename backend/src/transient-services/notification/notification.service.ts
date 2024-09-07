import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import { UserService } from "@/entities/user/user.service";
import { OfflineryNotification } from "@/types/notification-message.types";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { Expo, ExpoPushTicket } from "expo-server-sdk";

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
