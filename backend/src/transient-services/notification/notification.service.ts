import { Injectable } from '@nestjs/common';
import {Expo, ExpoPushMessage} from 'expo-server-sdk';

@Injectable()
export class NotificationService {
    private expo: Expo;

    constructor() {
        this.expo = new Expo();
    }

    async sendPushNotification(pushToken: string, message: string, data?: object) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return;
        }

        const messages: ExpoPushMessage[] = [{
            to: pushToken,
            sound: 'default',
            body: message,
            data: data,
        }];

        try {
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets = [];
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error(error);
                }
            }
            return tickets;
        } catch (error) {
            console.error(error);
        }
    }
}