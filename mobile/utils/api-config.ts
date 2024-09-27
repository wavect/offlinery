import { Configuration } from "@/api/gen/src/runtime";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
} from "@/services/secure-storage.service";

import {
    AuthApi,
    EncounterApi,
    MapApi,
    PendingUserApi,
    PushNotificationsApi,
    UserApi,
    UserReportsApi,
} from "@/api/gen/src";

/** @DEV add new ApiClasses here */
type ApiClasses = {
    auth: AuthApi;
    encounter: EncounterApi;
    pushNotifications: PushNotificationsApi;
    pendingUser: PendingUserApi;
    user: UserApi;
    map: MapApi;
    userReport: UserReportsApi;
};

class ApiManager {
    private static instance: ApiManager;
    private config: Configuration;
    private readonly apis: ApiClasses;

    private constructor() {
        this.config = this.createConfiguration();
        this.apis = this.initApis();
    }

    /** @DEV initialize new ApiClasses here */
    private initApis(): ApiClasses {
        return {
            auth: new AuthApi(this.config),
            encounter: new EncounterApi(this.config),
            pushNotifications: new PushNotificationsApi(this.config),
            pendingUser: new PendingUserApi(this.config),
            user: new UserApi(this.config),
            map: new MapApi(this.config),
            userReport: new UserReportsApi(this.config),
        };
    }

    public get api(): ApiClasses {
        return this.apis;
    }

    public static getInstance(): ApiManager {
        if (!ApiManager.instance) {
            ApiManager.instance = new ApiManager();
        }
        return ApiManager.instance;
    }

    private createConfiguration(): Configuration {
        const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
        return new Configuration({
            accessToken: jwtToken!,
            middleware: [
                {
                    pre: async (context: any) => {
                        await this.ensureValidToken();
                        context.init.headers = {
                            ...context.init.headers,
                            Authorization: `Bearer ${getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN)}`,
                        };
                        return context;
                    },
                },
            ],
        });
    }

    private async ensureValidToken(): Promise<void> {
        const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
        const refreshToken = getSecurelyStoredValue(
            SECURE_VALUE.JWT_REFRESH_TOKEN,
        );

        // if (jwtExpiresSoon(jwtToken!)) {
        //     try {
        //         console.log("Token has expired. Requesting a new token.");
        //         const authApi = new AuthApi(this.config);
        //         const refreshResponse = await authApi.authControllerRefreshJwtToken({
        //             refreshJwtDTO: { refreshToken },
        //         }) as any;
        //         saveValueLocallySecurely(SECURE_VALUE.JWT_REFRESH_TOKEN, refreshResponse.refreshToken);
        //         saveValueLocallySecurely(SECURE_VALUE.JWT_ACCESS_TOKEN, refreshResponse.accessToken);
        //         console.log("JWT and Refresh update successful.");
        //         this.config = this.createConfiguration();
        //     } catch (e) {
        //         console.error("Error during refreshing tokens: ", e);
        //         throw e;
        //     }
        // }
    }
}

type ApiProxyType = ApiClasses & {
    api: ApiClasses;
};

const apiProxy = new Proxy(ApiManager.getInstance(), {
    get(target, prop) {
        if (prop === "api") {
            return target.api;
        }
        return target.api[prop as keyof ApiClasses];
    },
}) as unknown as ApiProxyType;

export const API = apiProxy;
