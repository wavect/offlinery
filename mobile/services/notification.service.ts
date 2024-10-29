import { StorePushTokenDTO } from "@/api/gen/src";
import { Color } from "@/GlobalStyles";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
    saveValueLocallySecurely,
    SECURE_VALUE,
} from "./secure-storage.service";

const getExpoProjectId = () => {
    // Try multiple methods to get project ID
    let projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
        projectId = Constants.easConfig?.projectId;
    }

    if (!projectId && Constants.manifest2) {
        // For Expo Go
        projectId = Constants.manifest2?.extra?.eas?.projectId;
    }

    if (!projectId) {
        throw new Error(
            "Project ID not found. Make sure it's configured in app.json or app.config.js",
        );
    }

    console.log("Using project ID:", projectId); // Helpful for debugging
    return projectId;
};

export const registerForPushNotificationsAsync = async (userId: string) => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: Color.primaryBright,
        });
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
    }

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    let token: string | null;
    try {
        const projectId = getExpoProjectId();
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
    } catch (error) {
        console.error(" Failed to get expo push token", error);
        Sentry.captureException(error, {
            tags: {
                notifications: "getPushToken",
            },
        });
        return;
    }

    console.log("current user: ");

    // Send this token to your backend
    const storePushTokenDTO: StorePushTokenDTO = {
        pushToken: token,
    };

    try {
        await API.pushNotifications.notificationControllerStorePushToken({
            userId,
            storePushTokenDTO,
        });
        saveValueLocallySecurely(SECURE_VALUE.EXPO_PUSH_TOKEN, token);
    } catch (error) {
        console.error("Failed to send push token to backend:", error);
        Sentry.captureException(error, {
            tags: {
                notifications: "pushToken",
            },
        });
        throw error;
    }

    return token;
};
