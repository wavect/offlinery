import { IUserData } from "@/context/UserContext";
import {
    deleteSecurelyStoredValue,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { NativeStackNavigationOptions } from "react-native-screens/native-stack";

/** @dev React-native-mmkv is blazing fast as it uses native modules. For that reason it does not work with Expo Go. To keep Expo Go working, we fallback to secure service if not available. */
const getStorageLib = () => {
    try {
        // extra encryption, if we are paranoid: https://github.com/Tencent/MMKV/wiki/android_advance#encryption (also for ios)
        // @dev For sensitive values like the JWToken please use the secure-storage.service.ts (slightly slower)

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
    HAS_SEEN_INTRO = "has_seen_intro",
    ONBOARDING_SCREEN = "onboarding_screen",
    ONBOARDING_USER = "onboarding_user",
}

export const saveLocalValue = (key: LOCAL_VALUE, value: string) => {
    if (storage) {
        // @dev use mmkv
        storage.set(key, value);
    } else {
        // @dev use expo-secure-storage if mmkv not available (e.g. for expo go)
        saveValueLocallySecurely(key, value);
    }
};

export const getLocalValue = (key: LOCAL_VALUE) => {
    if (storage) {
        // @dev use mmkv
        return storage.getString(key);
    } else {
        // @dev use expo-secure-storage if mmkv not available (e.g. for expo go)
        return getSecurelyStoredValue(key);
    }
};

export const deleteLocalValue = (key: LOCAL_VALUE) => {
    if (storage) {
        // @dev use mmkv
        return storage.delete(key);
    } else {
        // @dev use expo-secure-storage if mmkv not available (e.g. for expo go)
        return deleteSecurelyStoredValue(key);
    }
};

export const saveDeviceUserHasSeenIntro = () => {
    saveLocalValue(LOCAL_VALUE.HAS_SEEN_INTRO, "true");
};

export const getDeviceUserHasSeenIntro = () => {
    return getLocalValue(LOCAL_VALUE.HAS_SEEN_INTRO);
};

export const saveOnboardingState = (
    state: IUserData,
    stack: NativeStackNavigationOptions,
) => {
    saveLocalValue(LOCAL_VALUE.ONBOARDING_USER, JSON.stringify(state));
    saveLocalValue(LOCAL_VALUE.ONBOARDING_SCREEN, JSON.stringify(stack));
};

export const deleteOnboardingState = async () => {
    deleteLocalValue(LOCAL_VALUE.ONBOARDING_SCREEN);
    deleteLocalValue(LOCAL_VALUE.ONBOARDING_USER);
};
