import * as SecureStore from "expo-secure-store";

export const SECURE_VALUE = {
    USER_ID: "USER_ID",
    ACCESS_BLOCKED: "ACCCESS_BLOCKED",
    JWT_ACCESS_TOKEN: "JWT_ACCESS_TOKEN",
    JWT_REFRESH_TOKEN: "JWT_REFRESH_TOKEN",
};

/** @dev Retrieves securely stored value from local storage. Helper function to make switching etc easier if needed. */
export const getSecurelyStoredValue = async (key: string) => {
    return await SecureStore.getItemAsync(key);
};

/** @dev Saves value in local, secure storage */
export const saveValueLocallySecurely = async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
};
