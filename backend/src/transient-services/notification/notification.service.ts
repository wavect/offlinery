import {Injectable, Logger} from '@nestjs/common';
import {Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushToken} from 'expo-server-sdk';
import {OfflineryNotification} from "./notification-message.type";

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private expo: Expo;

    constructor() {
        this.expo = new Expo();
    }

    /** @dev The ExpoPushToken remains the same for the user infinitely, except they reinstall the app, etc. */
    async sendPushNotification(pushToken: ExpoPushToken, messages: OfflineryNotification[]) {
        // TODO: ensure messages and pushToken are the same, maybe have some wrapper functions or whatever, or load directly from userEntity, etc.
        if (!Expo.isExpoPushToken(pushToken)) {
            this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
            return [];
        }

        const tickets: ExpoPushTicket[] = [];
        try {
            const chunks = this.expo.chunkPushNotifications(messages);
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
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