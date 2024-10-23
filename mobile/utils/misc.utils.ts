import { CreateUserDTOPreferredLanguageEnum } from "@/api/gen/src";
import { IUserData } from "@/context/UserContext";
import { i18n, TR } from "@/localization/translate.service";
import {
    saveValueLocallySecurely,
    SECURE_VALUE,
} from "@/services/secure-storage.service";
import { SUPPORT_MAIL } from "@/utils/general.constants";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import { Alert, Linking, Platform } from "react-native";
import { NativeStackNavigationOptions } from "react-native-screens/lib/typescript/native-stack";

export const REFRESH_REMAINING_MINUTE = 1;

export const isExpoGoEnvironment = Constants.appOwnership === "expo";

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/** @dev Utility function to check if Partial<T> has all properties defined and satisfies the T type. */
export function isComplete<T>(obj: Partial<T>): obj is T {
    return (
        (Object.keys(obj) as Array<keyof T>).length >=
        (Object.keys({} as { [K in RequiredKeys<T>]: true }) as Array<keyof T>)
            .length
    );
}

export const jwtExpiresSoon = (token: string) => {
    const decodedJWT = decodeJWT(token);

    if (decodedJWT && decodedJWT.exp) {
        const expirationDate = new Date(decodedJWT.exp * 1000);
        const currentDate = new Date();
        const timeDifference = expirationDate.getTime() - currentDate.getTime();
        const minutesDifference = timeDifference / (1000 * 60);
        return minutesDifference <= REFRESH_REMAINING_MINUTE; // Refresh prior to invalidation
    } else {
        console.log("Unable to check if expired. Invalid Token received.");
    }
};

function decodeJWT(token: string) {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        throw error;
    }
}

export const getLocalLanguageID = (): CreateUserDTOPreferredLanguageEnum => {
    return (
        (i18n.locale as CreateUserDTOPreferredLanguageEnum) ??
        CreateUserDTOPreferredLanguageEnum.en
    );
};

export const isNumericRegex = /^\d+$/;

export const writeSupportEmail = async () => {
    await Linking.openURL(`mailto:${SUPPORT_MAIL}`);
};

export const openAppSettings = async () => {
    if (Platform.OS === "ios") {
        Linking.openURL("app-settings:");
    } else if (Platform.OS === "android") {
        await Linking.openSettings();
    }
};

export const showOpenAppSettingsAlert = (
    body: string,
    onOpenAppSettings: Function = openAppSettings,
) => {
    Alert.alert(
        i18n.t(TR.permissionRequired),
        body,
        [
            {
                text: i18n.t(TR.cancel),
                style: "cancel",
            },
            {
                text: i18n.t(TR.goToSettings),
                onPress: () => onOpenAppSettings(),
            },
        ],
        { cancelable: true },
    );
};

export const saveOnboardingState = (
    state: IUserData,
    stack: NativeStackNavigationOptions,
) => {
    saveValueLocallySecurely(
        SECURE_VALUE.ONBOARDING_USER,
        JSON.stringify(state),
    );
    saveValueLocallySecurely(
        SECURE_VALUE.ONBOARDING_SCREEN,
        JSON.stringify(stack),
    );
};
