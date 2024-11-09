import * as SecureStore from "expo-secure-store";

export const SECURE_VALUE = {
    USER_ID: "USER_ID",
    JWT_ACCESS_TOKEN: "JWT_ACCESS_TOKEN",
    JWT_REFRESH_TOKEN: "JWT_REFRESH_TOKEN",
    EXPO_PUSH_TOKEN: "EXPO_PUSH_TOKEN",
};

export const isSecretStorageAvailable = () => {
    return SecureStore.isAvailableAsync();
};

/** @dev Retrieves securely stored value from local storage. Helper function to make switching etc easier if needed. */
export const getSecurelyStoredValue = (key: string) => {
    return SecureStore.getItem(key, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
};

/** @dev Saves value in local, secure storage */
export const saveValueLocallySecurely = (key: string, value: string) => {
    SecureStore.setItem(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
};

export const deleteSecurelyStoredValue = async (key: string) => {
    await SecureStore.deleteItemAsync(key, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
};

export const deleteSessionDataFromStorage = async () => {
    const deleteOps: Promise<void>[] = [
        deleteSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN),
        deleteSecurelyStoredValue(SECURE_VALUE.JWT_REFRESH_TOKEN),
    ];
    await Promise.all(deleteOps);
};
