import { AuthApi, SignInResponseDTO } from "@/api/gen/src";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
} from "@/services/secure-storage.service";
import { getLocallyStoredUserData } from "@/services/storage.service";

export const REFRESH_REMAINING_MINUTE = 1;

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * @DEV JWT Intercept & Refresh
 */
export const includeJWT = async (): Promise<RequestInit> => {
    const jwtToken = await getSecurelyStoredValue(
        SECURE_VALUE.JWT_ACCESS_TOKEN,
    );
    const refreshToken = await getSecurelyStoredValue(
        SECURE_VALUE.JWT_REFRESH_TOKEN,
    );

    const userData = getLocallyStoredUserData();
    console.log("userdata: ", userData);

    if (!refreshToken) {
        throw new Error("User does not have an refresh token!");
    }

    if (jwtExpiresSoon(jwtToken!)) {
        try {
            console.log(`Token has expired. Requesting a new token.`);
            const authApi = new AuthApi();
            const refreshResponse: SignInResponseDTO =
                (await authApi.authControllerRefreshJwtToken({
                    refreshJwtDTO: {
                        refreshToken: refreshToken,
                    },
                })) as SignInResponseDTO;

            await saveValueLocallySecurely(
                SECURE_VALUE.JWT_REFRESH_TOKEN,
                refreshResponse.refreshToken,
            );
            await saveValueLocallySecurely(
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
    const expirationDate = new Date(decodedJWT.exp * 1000);
    const currentDate = new Date();
    const timeDifference = expirationDate.getTime() - currentDate.getTime();
    const minutesDifference = timeDifference / (1000 * 60);
    return minutesDifference <= REFRESH_REMAINING_MINUTE; // Refresh prior to invalidation
};

function decodeJWT(token: string) {
    const base64Url = token.split(".")[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Convert from Base64URL to Base64
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
    );
    return JSON.parse(jsonPayload);
}
