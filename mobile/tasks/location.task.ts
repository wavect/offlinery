import { LocationDTO } from "@/api/gen/src";
import { Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { getLocalValue, LOCAL_VALUE } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import BackgroundGeolocation, {
    Subscription,
} from "react-native-background-geolocation";

interface LocationUpdateDTO {
    latitude: number;
    longitude: number;
}

export class OBackgroundLocationService {
    private static instance?: OBackgroundLocationService;
    private locationSubscription?: Subscription;
    private heartbeatSubscription?: Subscription;

    public static getInstance(): OBackgroundLocationService {
        if (!this.instance) {
            this.instance = new OBackgroundLocationService();
        }
        return this.instance;
    }

    private async getUserId(): Promise<string> {
        try {
            const userId = await getLocalValue(LOCAL_VALUE.USER_ID);
            if (!userId) {
                throw new Error("User ID is undefined");
            }
            return userId;
        } catch (error) {
            Sentry.captureException(error, {
                tags: { location_service: "getUserData" },
            });
            throw error;
        }
    }

    private async updateUserLocation(
        userId: string,
        locationUpdateDTO: LocationDTO,
    ): Promise<void> {
        try {
            await API.user.userControllerUpdateLocation({
                userId,
                locationUpdateDTO,
            });
            console.log(
                "[LOCATION_UPDATE]: User Location updated successfully",
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Error updating location:", errorMessage);
            Sentry.captureException(error, {
                tags: { location_service: "updateLocation" },
                extra: {
                    userId,
                    locationData: locationUpdateDTO,
                },
            });
            throw error;
        }
    }

    private saveLocation = async (latitude?: number, longitude?: number) => {
        try {
            if (!latitude || !longitude) {
                Sentry.captureException(
                    new Error(
                        "Latitude or Longitude have not been provided by system.",
                    ),
                    {
                        tags: { location_service: "saveLocation" },
                        extra: {
                            latitude,
                            longitude,
                        },
                    },
                );
                return;
            }
            const userId = await this.getUserId();
            const locationUpdateDTO: LocationUpdateDTO = {
                latitude,
                longitude,
            };

            await this.updateUserLocation(userId, locationUpdateDTO);
        } catch (error) {
            Sentry.captureException(error, {
                tags: { location_service: "onLocationUpdate" },
            });
        }
    };

    public async initialize(): Promise<boolean> {
        try {
            const { enabled: enabledPre } =
                await BackgroundGeolocation.getState();
            if (
                enabledPre &&
                this.locationSubscription &&
                this.heartbeatSubscription
            ) {
                console.log(
                    `Someone tried to re-initialize the location service. Aborted.`,
                );
                return true;
            }

            this.locationSubscription = BackgroundGeolocation.onLocation(
                (location) => {
                    // TODO: we might want to include altitude in future too?
                    this.saveLocation(
                        location?.coords?.latitude,
                        location?.coords?.longitude,
                    ).catch((error) => {
                        Sentry.captureException(error, {
                            tags: { location_service: "saveLocation:fail" },
                        });
                    });
                },
                (error) => {
                    Sentry.captureException(error, {
                        tags: { location_service: "onLocation:onFailure" },
                    });
                },
            );

            this.heartbeatSubscription = BackgroundGeolocation.onHeartbeat(
                (event) => {
                    BackgroundGeolocation.getCurrentPosition({
                        samples: 1,
                        desiredAccuracy:
                            BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
                    })?.then((loc) => {
                        this.saveLocation(
                            loc?.coords?.latitude,
                            loc?.coords?.longitude,
                        ).catch((error) => {
                            Sentry.captureException(error, {
                                tags: {
                                    location_service:
                                        "heartBeatSaveLocation:fail",
                                },
                            });
                        });
                    });
                },
            );

            const { enabled } = await BackgroundGeolocation.ready({
                desiredAccuracy:
                    BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
                // distanceFilter, @dev use elastic distance filter default
                stopOnTerminate: false,
                startOnBoot: true,
                locationAuthorizationRequest: "Always",
                locationAuthorizationAlert: {
                    titleWhenNotEnabled: i18n.t(TR.permissionToLocationDenied),
                    titleWhenOff: i18n.t(TR.locationServiceOff),
                    instructions: i18n.t(
                        TR.permissionToBackgroundLocationDenied,
                    ),
                    cancelButton: i18n.t(TR.cancel),
                    settingsButton: i18n.t(TR.goToSettings),
                },
                backgroundPermissionRationale: {
                    title: i18n.t(TR.locationPermissionTitleRequest),
                    message: i18n.t(TR.locationPermissionMessageRequest),
                    positiveAction: i18n.t(TR.locationPermissionPositiveAction),
                },
                logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
                batchSync: false, // TODO: does this make sense in future?
                autoSync: false, // TODO: makes sense in future? sync each location to server as it arrives
                locationUpdateInterval: 5 * 60 * 1000, // 5 minutes
                fastestLocationUpdateInterval: 3 * 60 * 1000, // 3 minutes
                locationTimeout: 180, // @dev extend timeout due to errors within 60s default range
                activityType:
                    BackgroundGeolocation.ACTIVITY_TYPE_OTHER_NAVIGATION,
                preventSuspend: true, // @dev https://transistorsoft.github.io/react-native-background-geolocation/interfaces/config.html#preventsuspend
                heartbeatInterval: 60 * 5, // 5 min
                notification: {
                    title: i18n.t(TR.bgLocationServiceTitle),
                    text: i18n.t(TR.bgLocationServiceBody),
                    color: Color.primary,
                    // @dev user feedback to be otherwise very annoying.
                    sticky: true,
                    priority: BackgroundGeolocation.NOTIFICATION_PRIORITY_MIN,
                },
            });
            return enabled;
        } catch (error) {
            Sentry.captureException(error, {
                tags: { location_service: "initialization" },
            });
        }
        return false;
    }

    public async start(): Promise<void> {
        try {
            const enabled = await this.initialize();
            if (!enabled) {
                const geoLocState = await BackgroundGeolocation.getState();
                // @dev if for whatever reason not running, restart.
                if (!geoLocState.enabled) {
                    await BackgroundGeolocation.start();
                }
            }
            // @dev change to background location always (show dialog to user)
            await BackgroundGeolocation.setConfig({
                locationAuthorizationRequest: "Always",
            });
        } catch (error) {
            Sentry.captureException(error, {
                tags: { location_service: "start" },
            });
        }
    }

    public async stop(): Promise<void> {
        try {
            await BackgroundGeolocation.stop();
            await BackgroundGeolocation.removeAllListeners();
        } catch (error) {
            Sentry.captureException(error, {
                tags: { location_service: "stop" },
            });
        }
    }
}
