import { Color } from "@/GlobalStyles";
import { i18n, TR } from "@/localization/translate.service";
import { isSecretStorageAvailable } from "@/services/secure-storage.service";
import { getLocalValue, LOCAL_VALUE } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { setupSentry } from "@/utils/sentry.utils";
import * as Sentry from "@sentry/react-native";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

export const LOCATION_TASK_NAME = "background-location-task";

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

const getUserId = (): string => {
    try {
        const userId = getLocalValue(LOCAL_VALUE.USER_ID);
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

        if (!(await isSecretStorageAvailable())) {
            const storageErr = new Error(
                "Secret storage not available right now.",
            );
            Sentry.captureException(storageErr, {
                tags: {
                    location_service: "backgroundTaskSecretStorage",
                },
            });
            throw storageErr;
        }

        const userId = getUserId();
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

export const stopLocationBackgroundTask = async () => {
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

export const startLocationBackgroundTask = async (
    userId: string | undefined,
) => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status === "granted" && userId) {
        const isRunning =
            await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (!isRunning) {
            console.log(
                `Starting locationBackground task ${LOCATION_TASK_NAME}`,
            );
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                /** @dev BestForNavigation more accurate than High but higher battery consumption (high already 10m) */
                accuracy: Location.Accuracy.BestForNavigation, // TODO: Maybe we want to track rougher locations continiously and BestForNavigation once people approach each other?
                timeInterval: 120_000, // 120 seconds
                distanceInterval: 10, // or 10m
                // TODO: not necessary probably as showBackgroundLocationIndicator=true but might help if we have problems, allowsBackgroundLocationUpdates: true,
                // @dev Ensure the task runs even when the app is in the background, still sending updates even if device isn't moving
                pausesUpdatesAutomatically: false, // TODO: We might be able to set this to true to save battery life, but for now we want to have maximum accuracy
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
        } else {
            /** @dev OS specific behavior of calling startLocationUpdatesAsync repeatedly:
             *
             * iOS: Will restart service. (the if check avoids that)
             * Android: Existing service NOT stopped, just a configuration update.
             * */
            console.log(
                `Background location service already running. Not starting again.`,
            );
        }
    }
};
