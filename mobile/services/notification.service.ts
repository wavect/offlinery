import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import {PushNotificationsApi, StorePushTokenDto} from "../api/gen/src";

const notificationsApi = new PushNotificationsApi()
export const registerForPushNotificationsAsync = async (userId: number) => {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Notification token", token);

    // Send this token to your backend
    const storePushTokenDto: StorePushTokenDto = {
        userId: userId,
        pushToken: token
    };

    try {
        await notificationsApi.pushNotificationControllerStorePushToken({ storePushTokenDto });
        console.log('Push token successfully sent to backend');
    } catch (error) {
        // TODO
        console.error('Failed to send push token to backend:', error);
    }

    return token;
}