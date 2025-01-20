import { IUserData } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationOptions } from "react-native-screens/native-stack";

/** @dev React-native-mmkv is blazing fast as it uses native modules. For that reason it does not work with Expo Go. To keep Expo Go working, we fallback to secure service if not available. */
const getStorageLib = () => {
    try {
        // extra encryption, if we are paranoid: https://github.com/Tencent/MMKV/wiki/android_advance#encryption (also for ios)
        // TODO: For sensitive values like the JWToken we should use encryption in future (expo-secure-storage not working for background service!!)

        // Try to use MMKV in development on native platforms
        const MMKV = require("react-native-mmkv").MMKV;
        return new MMKV();
    } catch {
        // Fallback to SecureStore if MMKV is not available (e.g., in Expo Go)
        return false;
    }
};
/** @dev If MMKV store defined use it, otherwise is false to use secure-service instead. */
const storage = getStorageLib();

export enum LOCAL_VALUE {
    USER_ID = "user_id",
    HAS_DONE_FIND_WALKTHROUGH = "has_done_find_walkthrough",
    HAS_DONE_ENCOUNTER_WALKTHROUGH = "has_done_encounter_walkthrough",
    HAS_SEEN_INTRO = "has_seen_intro",
    ONBOARDING_SCREEN = "onboarding_screen",
    ONBOARDING_USER = "onboarding_user",
    JWT_ACCESS_TOKEN = "jwt_access_token",
    JWT_REFRESH_TOKEN = "jwt_refresh_token",
    EXPO_PUSH_TOKEN = "expo_push_token",
}

export const saveLocalValue = async (key: LOCAL_VALUE, value: string) => {
    if (storage) {
        // @dev use mmkv
        await storage.set(key, value);
    } else {
        // @dev use async-storage if mmkv not available (e.g. for expo go)
        await AsyncStorage.setItem(key, value);
    }
};

export const getLocalValue = async (key: LOCAL_VALUE) => {
    if (storage) {
        // @dev use mmkv
        return await storage.getString(key);
    } else {
        // @dev use async-storage if mmkv not available (e.g. for expo go)
        return await AsyncStorage.getItem(key);
    }
};

export const deleteLocalValue = async (key: LOCAL_VALUE): Promise<any> => {
    if (storage) {
        // @dev use mmkv
        return await storage.delete(key);
    } else {
        // @dev use async storage if mmkv not available (e.g. for expo go)
        return await AsyncStorage.removeItem(key);
    }
};

const deleteLocalValues = (keys: LOCAL_VALUE[]): Promise<any> => {
    const ops: Promise<any>[] = keys.map((k) => deleteLocalValue(k));
    return Promise.all(ops);
};

export const saveDeviceUserHasSeenIntro = async () => {
    await saveLocalValue(LOCAL_VALUE.HAS_SEEN_INTRO, "true");
};

export const getDeviceUserHasSeenIntro = async () => {
    return getLocalValue(LOCAL_VALUE.HAS_SEEN_INTRO);
};

export const saveOnboardingState = async (
    state: IUserData,
    stack: NativeStackNavigationOptions,
) => {
    const ops: Promise<void>[] = [
        saveLocalValue(LOCAL_VALUE.ONBOARDING_USER, JSON.stringify(state)),
        saveLocalValue(LOCAL_VALUE.ONBOARDING_SCREEN, JSON.stringify(stack)),
    ];
    await Promise.all(ops);
};

export const saveJWTValues = async (
    jwtAccessToken: string,
    jwtRefreshToken: string,
) => {
    const ops: Promise<void>[] = [
        saveLocalValue(LOCAL_VALUE.JWT_ACCESS_TOKEN, jwtAccessToken),
        saveLocalValue(LOCAL_VALUE.JWT_REFRESH_TOKEN, jwtRefreshToken),
    ];
    await Promise.all(ops);
};

export const deleteOnboardingState = async () => {
    return await deleteLocalValues([
        LOCAL_VALUE.ONBOARDING_SCREEN,
        LOCAL_VALUE.ONBOARDING_USER,
    ]);
};

export const deleteSessionDataFromStorage = async () => {
    return await deleteLocalValues([
        LOCAL_VALUE.JWT_ACCESS_TOKEN,
        LOCAL_VALUE.JWT_REFRESH_TOKEN,
        LOCAL_VALUE.EXPO_PUSH_TOKEN,
    ]);
};
