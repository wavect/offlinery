import { Configuration, RequestContext } from "@/api/gen/src/runtime";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
    saveValueLocallySecurely,
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
import { jwtExpiresSoon } from "./misc.utils";

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
    private apis: ApiClasses;
    /** @DEV keeps track of an ongoing token refresh */
    private refreshPromise: Promise<string> | null = null;

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
        apiConfigLogger("Middleware intercepted");

        const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
        return new Configuration({
            accessToken: jwtToken!,
            middleware: [
                {
                    pre: async (request: RequestContext) => {
                        const accessToken = await this.ensureValidToken();

                        request.init.headers = {
                            ...request.init.headers,
                            Authorization: `Bearer ${accessToken}`,
                        };
                        if (request.url.includes("/auth/")) {
                            let body: Record<string, any> = {};
                            body = JSON.parse(
                                request.init.body?.valueOf().toString() ?? "",
                            );
                            body.jwtAccessToken = accessToken;
                            request.init.body = JSON.stringify(body);
                        }
                        return request;
                    },
                },
            ],
        });
    }

    public async ensureValidToken(): Promise<string> {
        let jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);

        if (jwtToken && !jwtExpiresSoon(jwtToken)) {
            apiConfigLogger("✓ Valid JWT ");
            return jwtToken;
        }

        if (!this.refreshPromise) {
            apiConfigLogger(
                "No current token refresh running. Requesting refresh now...",
            );
            this.refreshPromise = this.refreshToken().finally(() => {
                this.refreshPromise = null;
            });
        } else {
            apiConfigLogger("Token Refresh is already running. Waiting...");
        }

        await this.refreshPromise;

        /** @DEV super important: make sure after the refresh promise was handled, the new token gets returned*/
        return getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN)!;
    }

    private async refreshToken(): Promise<string> {
        const refreshToken = getSecurelyStoredValue(
            SECURE_VALUE.JWT_REFRESH_TOKEN,
        );

        if (!refreshToken) {
            throw new Error("No refresh token found.");
        }

        try {
            // TODO: Endpoint is still public
            const authApi = new AuthApi();
            const refreshResponse =
                (await authApi.authControllerRefreshJwtToken({
                    refreshJwtDTO: { refreshToken },
                })) as any;

            saveValueLocallySecurely(
                SECURE_VALUE.JWT_REFRESH_TOKEN,
                refreshResponse.refreshToken,
            );
            saveValueLocallySecurely(
                SECURE_VALUE.JWT_ACCESS_TOKEN,
                refreshResponse.accessToken,
            );
            apiConfigLogger("✓ JWT and Refresh update successful.");

            this.config = this.createConfiguration();
            this.apis = this.initApis();

            return refreshResponse.accessToken;
        } catch (e) {
            console.error(`- JWT unable to refresh. Logging user out`);
            saveValueLocallySecurely(SECURE_VALUE.JWT_ACCESS_TOKEN, "");
            saveValueLocallySecurely(SECURE_VALUE.JWT_REFRESH_TOKEN, "");
            throw e;
        }
    }
}

const apiConfigLogger = (msg: string) => {
    console.log(`[Api-Manager]: ${msg}`);
};

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
