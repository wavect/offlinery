import { StorePushTokenDTO } from "@/api/gen/src";
import { Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { initializeApp } from "firebase/app";
import { Platform } from "react-native";
import {
    saveValueLocallySecurely,
    SECURE_VALUE,
} from "./secure-storage.service";

export enum TokenFetchStatus {
    SUCCESS,
    ERROR,
    INVALID_DEVICE_OR_EMULATOR,
}
interface NotificationTokenFetchResponse {
    token: string | null;
    tokenFetchStatus: TokenFetchStatus;
}

/** @dev Notifications on iOS are tightly coupled with the OS.
 * On Android we need to EXPLICITLY initialize Firebase to show notifications, etc. */
const initializeFirebase = () => {
    if (Device.isDevice && Platform.OS === "android") {
        const firebaseConfig = {
            apiKey: "AIzaSyAmGdqKi4Kzdi4Ghzzv6g2qA29FxmvpRKc",
            authDomain: "offlinery-60d52.firebaseapp.com",
            projectId: "offlinery-60d52",
            storageBucket: "offlinery-60d52.appspot.com",
            messagingSenderId: "1054045326528",
            appId: "1:1054045326528:android:7c5f1bbb8663439e21b125",
        };

        initializeApp(firebaseConfig);
    }
};

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

export const registerForPushNotificationsAsync = async (
    userId: string,
): Promise<NotificationTokenFetchResponse> => {
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
        alert(i18n.t(TR.permissionNotificationRejected));
        return {
            token: null,
            tokenFetchStatus: TokenFetchStatus.ERROR,
        };
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
    // Check if physical device or emulator
    let token: string | null;
    if (!Device.isDevice) {
        return {
            token: null,
            tokenFetchStatus: TokenFetchStatus.INVALID_DEVICE_OR_EMULATOR,
        };
    }
    try {
        initializeFirebase();
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
        return {
            token: null,
            tokenFetchStatus: TokenFetchStatus.ERROR,
        };
    }

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
    return {
        token,
        tokenFetchStatus: TokenFetchStatus.SUCCESS,
    };
};
