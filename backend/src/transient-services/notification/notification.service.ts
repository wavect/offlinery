import {Injectable, Logger} from '@nestjs/common';
import {Expo, ExpoPushMessage, ExpoPushTicket} from 'expo-server-sdk';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private expo: Expo;

    constructor() {
        this.expo = new Expo();
    }

    async sendPushNotification(pushToken: string, message: string, data?: object) {
        if (!Expo.isExpoPushToken(pushToken)) {
            this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
            return;
        }

        const messages: ExpoPushMessage[] = [{
            to: pushToken,
            sound: 'default',
            body: message,
            data: data,
        }];

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