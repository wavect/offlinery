import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import {useEffect} from "react";

export const registerForPushNotificationsAsync = async () => {
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

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    // Send this token to your backend
    await sendTokenToBackend(token);

    return token;
}

/** @dev Uses useEffect() so only call from component */
export const handleIncomingNotifications = async () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });

// In your App.js or a relevant component
    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log(notification);
            // TODO: Handle the notification
        });

        return () => subscription.remove();
    }, []);
}