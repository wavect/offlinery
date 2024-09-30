import { CreateUserDTOPreferredLanguageEnum } from "@/api/gen/src";
import { i18n } from "@/localization/translate.service";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";

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
