import * as SecureStore from "expo-secure-store";

export const SECURE_VALUE = {
    USER_ID: "USER_ID",
    JWT_ACCESS_TOKEN: "JWT_ACCESS_TOKEN",
    JWT_REFRESH_TOKEN: "JWT_REFRESH_TOKEN",
};

/** @dev Retrieves securely stored value from local storage. Helper function to make switching etc easier if needed. */
export const getSecurelyStoredValue = (key: string) => {
    return SecureStore.getItem(key);
};

/** @dev Saves value in local, secure storage */
export const saveValueLocallySecurely = (key: string, value: string) => {
    SecureStore.setItem(key, value);
};

export const deleteSessionDataFromStorage = async () => {
    const deleteOps: Promise<void>[] = [
        SecureStore.deleteItemAsync(SECURE_VALUE.JWT_ACCESS_TOKEN),
        SecureStore.deleteItemAsync(SECURE_VALUE.JWT_REFRESH_TOKEN),
    ];
    await Promise.all(deleteOps);
};
