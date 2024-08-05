import * as Notifications from 'expo-notifications';
import {PushNotificationsApi, StorePushTokenDto} from "../api/gen/src";
import {Platform} from "react-native";
import {Color} from "../GlobalStyles";
import Constants from 'expo-constants';

const notificationsApi = new PushNotificationsApi()
export const registerForPushNotificationsAsync = async (userId: number) => {

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: Color.primaryLight,
        });
    }


    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
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
            shouldSetBadge: true,
        }),
    });

    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    let token: string;
    try {
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            throw new Error('Project ID not found');
        }
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
        console.log("Notification token", token);
    } catch (err) {
        console.error(' Failed to get expo push token', err)
        return;
    }

    // Send this token to your backend
    const storePushTokenDto: StorePushTokenDto = {
        userId: userId,
        pushToken: token
    };

    try {
        await notificationsApi.pushNotificationControllerStorePushToken({ storePushTokenDto });
        console.log('Push token successfully sent to backend');
    } catch (err) {
        // TODO
        console.error('Failed to send push token to backend:', err);
    }

    return token;
}