import { getLocallyStoredUserData } from "@/services/storage.service";
import { API } from "@/utils/api-config";
import { setupSentry } from "@/utils/sentry.utils";
import * as Sentry from "@sentry/react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

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

const getUserData = (): string => {
    try {
        const user = getLocallyStoredUserData();
        if (!user?.id) {
            throw new Error("User ID is undefined");
        }
        return user.id;
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

        const userId = getUserData();
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
