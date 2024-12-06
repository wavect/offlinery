import {
    AuthApi,
    EncounterApi,
    MapApi,
    PendingUserApi,
    PushNotificationsApi,
    SignInResponseDTOStatusEnum,
    UserApi,
    UserReportsApi,
} from "@/api/gen/src";
import { Configuration, RequestContext } from "@/api/gen/src/runtime";
import {
    LOCAL_VALUE,
    getLocalValue,
    saveJWTValues,
} from "@/services/storage.service";
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

        return new Configuration({
            // @dev not setting accesstoken here since will be set by middleware and we cannot use async ops here
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

    private async ensureValidToken(): Promise<string> {
        let jwtToken = await getLocalValue(LOCAL_VALUE.JWT_ACCESS_TOKEN);

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
        return await getLocalValue(LOCAL_VALUE.JWT_ACCESS_TOKEN)!;
    }

    private async refreshToken() {
        const refreshToken = await getLocalValue(LOCAL_VALUE.JWT_REFRESH_TOKEN);

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

            if (refreshResponse.status === SignInResponseDTOStatusEnum.VALID) {
                await saveJWTValues(
                    refreshResponse.accessToken,
                    refreshResponse.refreshToken,
                );
                apiConfigLogger("✓ JWT and Refresh update successful.");

                this.config = this.createConfiguration();
                this.apis = this.initApis();

                return refreshResponse.accessToken;
            } else if (
                refreshResponse.status.includes(
                    SignInResponseDTOStatusEnum.JWT_DECODE_ERROR,
                    SignInResponseDTOStatusEnum.JWT_INVALID,
                )
            ) {
                /** @DEV only reset the storage if we receive an JWT invalid code */
                await saveJWTValues("", "");
            }
        } catch (e) {
            console.error(
                `- Refresh failed due to network issue or unknown issue.`,
            );
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
