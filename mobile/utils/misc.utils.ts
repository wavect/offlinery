import { AuthApi } from "@/api/gen/src";
import {
    getSecurelyStoredValue,
    saveValueLocallySecurely,
    SECURE_VALUE,
} from "@/services/secure-storage.service";

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const blockedSequence = () => {};

/**
 * @DEV
 * ---
 * JWT Intercept & Refresh
 */
export const includeJWT = async (): Promise<RequestInit> => {
    const jwtToken = await getSecurelyStoredValue(
        SECURE_VALUE.JWT_ACCESS_TOKEN,
    );
    const refreshToken = await getSecurelyStoredValue(
        SECURE_VALUE.JWT_REFRESH_TOKEN,
    );

    if (!refreshToken) {
        throw new Error("User does not have an refresh token!");
    }

    console.log(
        `RT = ${refreshToken.slice(0, 6)} and AT = ${jwtToken?.slice(0, 6)}`,
    );

    const isExpiring = expiresSoon(jwtToken!);

    if (isExpiring) {
        try {
            console.log(
                `+++ [TOKEN EXPIRED] - Requesting new token: ${refreshToken}`,
            );
            const authApi = new AuthApi();
            console.log(`Refreshing... with RT=${refreshToken}`);

            const refreshResponse = await authApi.authControllerRefreshJwtToken(
                {
                    refreshJwtDTO: {
                        refreshToken: refreshToken,
                    },
                },
            );

            console.log("Token refreshed!", refreshResponse);
            console.log(`Storing new RT => ${refreshResponse.refreshToken}`);
            await saveValueLocallySecurely(
                SECURE_VALUE.JWT_REFRESH_TOKEN,
                refreshResponse.refreshToken,
            );

            console.log(`Storing new AT => ${refreshResponse.accessToken}`);
            await saveValueLocallySecurely(
                SECURE_VALUE.JWT_ACCESS_TOKEN,
                refreshResponse.accessToken,
            );
        } catch (e) {
            console.log("error: ", e);
            console.log(`error ${e}`);
            console.log("error is??", JSON.stringify(e));
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

export const expiresSoon = (token: string) => {
    const decodedJWT = decodeJWT(token);

    console.log();
    const expirationDate = new Date(decodedJWT.exp * 1000);
    const currentDate = new Date();
    const timeDifference = expirationDate.getTime() - currentDate.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    console.log("Minutes remaining until refresh: ", minutesDifference);

    // timeDifference is in minutes
    return minutesDifference <= 0.15;
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

    return JSON.parse(jsonPayload); // Convert to JSON object
}
