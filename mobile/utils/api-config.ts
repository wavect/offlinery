import {
    Configuration,
    FetchParams,
    Middleware,
    RequestContext,
} from "@/api/gen/src/runtime";
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

export const HEADER_CUSTOM_JWTOKEN = "O-Custom-JWToken";

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
        const middleware: Middleware = {
            pre: async (
                context: RequestContext,
            ): Promise<FetchParams | void> => {
                await this.ensureValidToken();
                let headers: Headers;
                if (context.init.headers instanceof Headers) {
                    headers = context.init.headers;
                } else if (context.init.headers) {
                    headers = new Headers(
                        context.init.headers as Record<string, string>,
                    );
                } else {
                    headers = new Headers();
                }

                const customToken = headers.get(HEADER_CUSTOM_JWTOKEN);
                const token =
                    customToken ||
                    getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);

                headers.set("Authorization", `Bearer ${token}`);
                headers.delete(HEADER_CUSTOM_JWTOKEN);

                context.init.headers = {
                    ...context.init.headers,
                    ...headers,
                };

                return context;
            },
        };

        return new Configuration({ middleware: [middleware] });
    }
    public withCustomToken(token: string): ApiClasses {
        const handler: ProxyHandler<ApiClasses> = {
            get: (target: ApiClasses, prop: string | symbol) => {
                const apiInstance = target[prop as keyof ApiClasses];
                if (typeof apiInstance === "object" && apiInstance !== null) {
                    return new Proxy(apiInstance, {
                        get: (apiTarget: any, apiProp: string | symbol) => {
                            if (typeof apiTarget[apiProp] === "function") {
                                return (...args: any[]) => {
                                    const headers = new Headers(
                                        args[args.length - 1]?.headers || {},
                                    );
                                    headers.set(HEADER_CUSTOM_JWTOKEN, token);
                                    args[args.length - 1] = {
                                        ...args[args.length - 1],
                                        headers,
                                    };
                                    return apiTarget[apiProp].apply(
                                        apiTarget,
                                        args,
                                    );
                                };
                            }
                            return apiTarget[apiProp];
                        },
                    });
                }
                return apiInstance;
            },
        };
        return new Proxy(this.apis, handler);
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
    withCustomToken: (token: string) => ApiClasses;
};

const API = new Proxy(ApiManager.getInstance(), {
    get(target, prop) {
        if (prop === "api") {
            return target.api;
        } else if (prop === "withCustomToken") {
            return (token: string) => target.withCustomToken(token);
        }
        return target.api[prop as keyof ApiClasses];
    },
}) as unknown as ApiProxyType;

export { API };
