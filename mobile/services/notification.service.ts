import { Color } from "@/GlobalStyles";
import {
    BaseNotificationADTOTypeEnum,
    EncounterPublicDTOStatusEnum,
    NotificationDidYouMeetDTO,
    NotificationNavigateUserDTO,
    NotificationNewMessageDTO,
    StorePushTokenDTO,
    UpdateEncounterStatusDTO,
} from "@/api/gen/src";
import { i18n, TR } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import {
    getLocalValue,
    LOCAL_VALUE,
    saveLocalValue,
} from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { CommonActions } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AndroidNotificationVisibility } from "expo-notifications";
import { initializeApp } from "firebase/app";
import { Platform } from "react-native";

export enum TokenFetchStatus {
    SUCCESS,
    ERROR,
    INVALID_DEVICE_OR_EMULATOR,
    ALREADY_SAVED,
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

    return projectId;
};

const setupNotificationCategories = async () => {
    await Notifications.setNotificationCategoryAsync(
        BaseNotificationADTOTypeEnum.did_you_meet,
        [
            {
                identifier: EncounterPublicDTOStatusEnum.not_met,
                buttonTitle: i18n.t(TR.encounterInterest.notMet),
                options: {
                    isAuthenticationRequired: false, // @dev device authentication (e.g. face id)
                    opensAppToForeground: false,
                },
            },
            {
                identifier: EncounterPublicDTOStatusEnum.met_interested,
                buttonTitle: i18n.t(TR.encounterInterest.metInterested),
                options: {
                    isAuthenticationRequired: false, // @dev device authentication (e.g. face id)
                    opensAppToForeground: false,
                },
            },
            {
                identifier: EncounterPublicDTOStatusEnum.met_not_interested,
                buttonTitle: i18n.t(TR.encounterInterest.metNotInterested),
                options: {
                    isAuthenticationRequired: false, // @dev device authentication (e.g. face id)
                    isDestructive: true,
                    opensAppToForeground: false,
                },
            },
        ],
    );

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: Color.primaryBright,
        });
        await Notifications.setNotificationChannelAsync(
            BaseNotificationADTOTypeEnum.did_you_meet,
            {
                name: BaseNotificationADTOTypeEnum.did_you_meet,
                importance: Notifications.AndroidImportance.HIGH,
                lightColor: Color.primaryBright,
                enableVibrate: true,
                showBadge: false,
                lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
            },
        );
    }
};

export const registerForPushNotificationsAsync = async (
    userId: string,
): Promise<NotificationTokenFetchResponse> => {
    await setupNotificationCategories();

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

    const existingPushToken: string = await getLocalValue(
        LOCAL_VALUE.EXPO_PUSH_TOKEN,
    );
    if (existingPushToken) {
        console.log(
            "Not saving/requesting new push token as already one locally available and saved on the backend.",
        );
        return {
            token: existingPushToken,
            tokenFetchStatus: TokenFetchStatus.ALREADY_SAVED,
        };
    }

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
        await saveLocalValue(LOCAL_VALUE.EXPO_PUSH_TOKEN, token);
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

export const reactToNewDidYouMeetNotification = async (
    response: Notifications.NotificationResponse,
    navigation: any,
) => {
    const interactiveActionId = response.actionIdentifier;
    const notificationData: NotificationDidYouMeetDTO = response.notification
        .request.content.data as NotificationDidYouMeetDTO;

    if (
        interactiveActionId === EncounterPublicDTOStatusEnum.not_met ||
        interactiveActionId ===
            EncounterPublicDTOStatusEnum.met_not_interested ||
        interactiveActionId === EncounterPublicDTOStatusEnum.met_interested
    ) {
        // @dev interactive notification btn clicked
        const userId = await getLocalValue(LOCAL_VALUE.USER_ID);
        if (!userId) {
            Sentry.captureException(
                new Error(
                    "No userId in local storage when user received didYouMeet notification and clicked interactive button.",
                ),
                {
                    tags: {
                        reactToNewDidYouMeetNotification: "getUserId",
                    },
                },
            );
            // @dev in that case we simply can't do anything since app not opened in foreground (desired), silent error
            return;
        }

        const updateEncounterStatusDTO: UpdateEncounterStatusDTO = {
            encounterId: notificationData.encounterId,
            status: interactiveActionId,
        };

        await API.encounter.encounterControllerUpdateStatus({
            updateEncounterStatusDTO,
            userId,
        });
    } else {
        // @dev notification tapped (no interactive button chosen), in this case the app is opened otherwise status is updated in the back
        navigation.navigate(ROUTES.MainTabView, {
            screen: notificationData.screen,
        });
    }
};

export const reactToNewMessageNotification = (
    response: Notifications.NotificationResponse,
    navigation: any,
) => {
    const notificationData: NotificationNewMessageDTO = response.notification
        .request.content.data as NotificationNewMessageDTO;

    navigation.navigate(ROUTES.MainTabView, {
        screen: notificationData.screen,
    });
};

export const reactToNewEncounterNotification = (
    response: Notifications.NotificationResponse,
    navigation: any,
) => {
    const notificationData: NotificationNavigateUserDTO = response.notification
        .request.content.data as NotificationNavigateUserDTO;

    if (!("navigateToPerson" in notificationData)) {
        Sentry.captureException(
            new Error("NavigateToPerson missing in notificationData"),
            {
                tags: {
                    notificationService: "newMatchNotification",
                    notificationData,
                },
            },
        );
        return;
    }
    // Navigate to the specified screen, passing the user object as a prop and add encounters view as prior screen to enable back logic
    navigation.dispatch(
        CommonActions.reset({
            index: 1, // This means the second screen (targetScreen) will be active
            routes: [
                {
                    name: ROUTES.MainTabView,
                    params: {
                        screen: ROUTES.Main.EncountersTab,
                    },
                },
                {
                    name: ROUTES.MainTabView,
                    params: {
                        screen: ROUTES.Main.EncountersTab,
                        params: {
                            screen: notificationData.screen,
                            params: {
                                navigateToPerson:
                                    notificationData.navigateToPerson,
                                encounterId: notificationData.encounterId,
                            },
                        },
                    },
                },
            ],
        }),
    );
};
