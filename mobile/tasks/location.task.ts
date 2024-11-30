import { Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { getLocalValue, LOCAL_VALUE } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { setupSentry } from "@/utils/sentry.utils";
import * as Sentry from "@sentry/react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

export const LOCATION_TASK_NAME = "background-location-task";
/// @dev Restarts the service if it's not running, e.g. when users restarted their device
export const SERVICE_RESTARTER_TASK_NAME = "service-starter";

interface LocationUpdateDTO {
    latitude: number;
    longitude: number;
}

// Helper function to validate location data
const isValidLocation = (location: Location.LocationObject): boolean => {
    return (
        location?.coords?.latitude !== undefined &&
        location?.coords?.longitude !== undefined &&
        !isNaN(location.coords.latitude) &&
        !isNaN(location.coords.longitude) &&
        Math.abs(location.coords.latitude) <= 90 &&
        Math.abs(location.coords.longitude) <= 180
    );
};

const getUserId = async (): Promise<string> => {
    try {
        const userId = await getLocalValue(LOCAL_VALUE.USER_ID);
        if (!userId) {
            throw new Error("User ID is undefined");
        }
        return userId;
    } catch (error) {
        Sentry.captureException(error, {
            tags: {
                location_service: "getUserData",
            },
        });
        throw error;
    }
};

// Helper function to update location
const updateUserLocation = async (
    userId: string,
    locationUpdateDTO: LocationUpdateDTO,
) => {
    try {
        await API.user.userControllerUpdateLocation({
            userId,
            locationUpdateDTO,
        });
        console.log(
            "[TASK:LOCATION_UPDATE]: User Location updated successfully",
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Error updating location:", errorMessage);
        Sentry.captureException(error, {
            tags: {
                location_service: "updateLocation",
            },
            extra: {
                userId: userId.slice(0, 8), // Only send first 8 chars for privacy
                locationData: locationUpdateDTO,
            },
        });
        throw error;
    }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState?.isInternetReachable) {
            console.warn(
                `Tried running backgroundLocationService but not active internet connection. Exiting function.`,
            );
            return;
        }

        setupSentry(true);

        if (error) {
            console.error(`Task error: ${error.message}`);
            Sentry.captureException(error, {
                tags: {
                    location_service: "taskError",
                },
            });
            return;
        }

        if (!data) {
            throw new Error("No data received from location task");
        }

        const locations = (data as any).locations as Location.LocationObject[];

        if (!locations?.length) {
            throw new Error("No locations received from location task");
        }

        const userId = await getUserId();
        console.log("User Connected: ", userId);

        const location = locations[locations.length - 1];

        if (!isValidLocation(location)) {
            throw new Error("Invalid location data received");
        }

        const locationUpdateDTO: LocationUpdateDTO = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        await updateUserLocation(userId, locationUpdateDTO);
    } catch (error) {
        console.error(
            "Location task failed:",
            error instanceof Error ? error.message : "Unknown error",
        );
        Sentry.captureException(error, {
            tags: {
                location_service: "backgroundTask",
            },
        });
    }
});

TaskManager.defineTask(SERVICE_RESTARTER_TASK_NAME, async () => {
    try {
        // @dev is location service running, if not restart from background fetch service
        const isServiceRunning =
            await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

        if (!isServiceRunning) {
            const userId = await getUserId();
            console.log("User Connected: ", userId);
            await startLocationBackgroundTask(userId);
            Sentry.captureMessage(
                "BackgroundFetch:Service restarter restarted location service as not running.",
            );
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (err) {
        Sentry.captureException(err, {
            tags: {
                task: "serviceRestarter_backgroundFetch",
            },
        });
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const stopLocationBackgroundTask = async () => {
    if (await TaskManager.isTaskRegisteredAsync(SERVICE_RESTARTER_TASK_NAME)) {
        // @dev make sure background fetch does not restart service
        await TaskManager.unregisterTaskAsync(SERVICE_RESTARTER_TASK_NAME);
    }
    if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
        await TaskManager.unregisterTaskAsync(LOCATION_TASK_NAME);
    }

    // @dev iOS live notification is created by us, not the OS. So we need to manage it ourselves.
    if (Platform.OS === "ios") {
        const allNotifications =
            await Notifications.getPresentedNotificationsAsync();
        for (let index = 0; index < allNotifications.length; index++) {
            const notification = allNotifications[index];
            if (
                notification.request.content.title?.includes(
                    i18n.t(TR.bgLocationServiceTitle),
                )
            ) {
                await Notifications.dismissNotificationAsync(
                    notification.request.identifier,
                );
            }
        }
    }
};

/// @dev iOS does not send a sticky notification as Android for services. So we create one ourselves.
const sendLocationNotification = async () => {
    if (Platform.OS === "ios") {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: i18n.t(TR.bgLocationServiceTitle),
                body: i18n.t(TR.bgLocationServiceBody),
            },
            trigger: null,
        });
    }
};

async function isBackgroundFetchServiceRestarterRunning(): Promise<boolean> {
    try {
        // Check if the task is registered
        return await TaskManager.isTaskRegisteredAsync(
            SERVICE_RESTARTER_TASK_NAME,
        );
    } catch (error) {
        console.error("Error checking background task:", error);
        Sentry.captureException(error, {
            tags: {
                backgroundFetchRestarter:
                    "isBackgroundFetchServiceRestarterRunning",
            },
        });
        return false;
    }
}

export const startLocationBackgroundTask = async (
    userId: string | undefined,
) => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted" && userId) {
        const isBgFetchRegistered =
            await isBackgroundFetchServiceRestarterRunning();
        if (!isBgFetchRegistered) {
            try {
                await BackgroundFetch.registerTaskAsync(
                    SERVICE_RESTARTER_TASK_NAME,
                    {
                        minimumInterval: 30 * 60, // 30 minutes
                        stopOnTerminate: false, // Android only
                        startOnBoot: true, // Android only
                    },
                );
            } catch (err) {
                console.log("Background fetch task Register failed:", err);
                Sentry.captureException(err, {
                    tags: {
                        location_service: "registerBackgroundFetchTask",
                    },
                });
            }
        }

        const isRunning =
            await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (!isRunning) {
            console.log(
                `Starting locationBackground task ${LOCATION_TASK_NAME}`,
            );
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                /** @dev BestForNavigation more accurate than High but higher battery consumption (high already 10m) */
                accuracy: Location.Accuracy.BestForNavigation, // TODO: Maybe we want to track rougher locations continiously and BestForNavigation once people approach each other?
                timeInterval: 300_000, // 5 minutes
                distanceInterval: 100, // or 100m
                deferredUpdatesInterval: 60_000, // 1 minute
                // TODO: not necessary probably as showBackgroundLocationIndicator=true but might help if we have problems, allowsBackgroundLocationUpdates: true,
                // @dev Ensure the task runs even when the app is in the background, still sending updates even if device isn't moving
                pausesUpdatesAutomatically: true,
                showsBackgroundLocationIndicator: true, // @dev Shows a blue bar/blue pill when your app is using location services in the background, iOS only
                // TODO: distanceFilter, deferredUpdatesDistance, etc.: minimum distance in meters a device must move before an update event is triggered -> later for saving battery life
                activityType: Location.ActivityType.OtherNavigation, // @dev Best for urban environments, different ways of movement (car, walking, ..)
                foregroundService: {
                    notificationTitle: i18n.t(TR.bgLocationServiceTitle),
                    notificationBody: i18n.t(TR.bgLocationServiceBody),
                    notificationColor: Color.primary,
                    killServiceOnDestroy: false, // @dev stay running if app is killed
                },
            });
            await sendLocationNotification();
            Sentry.captureMessage(
                "LocationService: Location service started as not running.",
            );
        } else {
            /** @dev OS specific behavior of calling startLocationUpdatesAsync repeatedly:
             *
             * iOS: Will restart service. (the if check avoids that)
             * Android: Existing service NOT stopped, just a configuration update.
             * */
            Sentry.captureMessage(
                `Background location service already running. Not starting again.`,
            );
        }
    } else {
        Sentry.captureException(
            "User denied location permission or userId undefined (unauthenticated)",
            {
                tags: {
                    location_service: "startLocationService",
                    userId,
                    status,
                },
            },
        );
    }
};
