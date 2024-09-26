import {
    CreateUserDTOPreferredLanguageEnum,
    SignInResponseDTO,
} from "@/api/gen/src";
import { i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { API } from "@/utils/api-config";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";

export const REFRESH_REMAINING_MINUTE = 1;

export const isExpoGoEnvironment = Constants.appOwnership === "expo";

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * @DEV JWT Intercept & Refresh
 */
export const includeJWT = async (): Promise<RequestInit> => {
    const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
    const refreshToken = getSecurelyStoredValue(SECURE_VALUE.JWT_REFRESH_TOKEN);

    if (!refreshToken) {
        throw new Error("User does not have an refresh token!");
    }

    if (jwtExpiresSoon(jwtToken!)) {
        try {
            console.log(`Token has expired. Requesting a new token.`);
            const refreshResponse: SignInResponseDTO =
                (await API.auth.authControllerRefreshJwtToken({
                    refreshJwtDTO: {
                        refreshToken: refreshToken,
                    },
                })) as SignInResponseDTO;

            saveValueLocallySecurely(
                SECURE_VALUE.JWT_REFRESH_TOKEN,
                refreshResponse.refreshToken,
            );
            saveValueLocallySecurely(
                SECURE_VALUE.JWT_ACCESS_TOKEN,
                refreshResponse.accessToken,
            );
            console.log("JWT and Refresh update successful.");
        } catch (e) {
            console.error("Error during refreshing tokens: ", e);
        }
    }

    if (!jwtToken) {
        throw new Error("No JWT available, authenticate first!");
    }
    return {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
        },
    };
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
