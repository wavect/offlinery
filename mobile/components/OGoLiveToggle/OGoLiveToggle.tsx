import { Color } from "@/GlobalStyles";
import {
    LocationUpdateDTO,
    UpdateUserDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
} from "@/services/secure-storage.service";
import { getLocallyStoredUserData } from "@/services/storage.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React from "react";
import { StyleProp, Switch, Text, View, ViewStyle } from "react-native";

interface IOGoLiveToggleProps {
    style?: StyleProp<ViewStyle>;
}

const LOCATION_TASK_NAME = "background-location-task";

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error(`Task error ${error}`);
        return;
    }
    if (data) {
        const locations = (data as any).locations as Location.LocationObject[];
        const user = getLocallyStoredUserData();
        console.log("User Connected: ", user?.id?.slice(0, 8));
        const userId = user?.id;
        const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
        if (!userId || !jwtToken) {
            console.error(
                "UserID and/or jwtToken undefined in location task service.",
            );
            return;
        }

        if (locations && locations.length > 0 && userId) {
            const location = locations[locations.length - 1];
            const locationUpdateDTO: LocationUpdateDTO = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            try {
                await API.user.userControllerUpdateLocation({
                    userId,
                    locationUpdateDTO: locationUpdateDTO,
                });
                console.log(
                    `[TASK:LOCATION_UPDATE]: User Location updated successfully`,
                );
            } catch (error) {
                console.error(
                    "Error updating location:",
                    JSON.stringify(error),
                );
            }
        }
    }
});

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const { dispatch, state } = useUserContext();

    const configureLocationTracking = async (
        newDateMode: UserPrivateDTODateModeEnum,
    ) => {
        if (newDateMode === UserPrivateDTODateModeEnum.live) {
            const { status } =
                await Location.requestBackgroundPermissionsAsync();
            if (status === "granted" && state.id) {
                console.log(`Live mode: Starting task ${LOCATION_TASK_NAME}`);
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
            }
        } else {
            try {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            } catch (err) {
                console.error(err);
            }
            console.log(
                "Not running location service due to user settings (ghost mode).",
            );
        }
    };

    const toggleSwitch = async () => {
        try {
            const { status: fStatus } =
                await Location.requestForegroundPermissionsAsync();
            if (fStatus !== "granted") {
                alert(i18n.t(TR.permissionToLocationDenied));
                return;
            }
            const { status: bStatus } =
                await Location.requestBackgroundPermissionsAsync();
            if (bStatus !== "granted") {
                alert(i18n.t(TR.permissionToBackgroundLocationDenied));
                return;
            }

            const newDateMode: UserPrivateDTODateModeEnum =
                state.dateMode === UserPrivateDTODateModeEnum.ghost
                    ? UserPrivateDTODateModeEnum.live
                    : UserPrivateDTODateModeEnum.ghost;
            const updateUserDTO: UpdateUserDTO = { dateMode: newDateMode };

            await API.user.userControllerUpdateUser({
                userId: state.id!,
                updateUserDTO,
            });

            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { dateMode: newDateMode },
            });

            await configureLocationTracking(newDateMode);

            if (newDateMode === UserPrivateDTODateModeEnum.live) {
                alert(`${i18n.t(TR.youAreLive)} ${getSuccessMessage()}`);
            } else {
                alert(i18n.t(TR.ghostModeDescr));
            }
        } catch (error: any) {
            console.error(
                "Error in toggleSwitch:",
                error.message,
                "\nStack trace:",
                error.stack,
            );
            alert(i18n.t(TR.errRequestingPermissions));
        }
    };

    const getSuccessMessage = () => {
        switch (state.approachChoice) {
            case UserPrivateDTOApproachChoiceEnum.both: // fall through
            case UserPrivateDTOApproachChoiceEnum.approach:
                return i18n.t(TR.youAreLiveApproachDescr);
                break;
            case UserPrivateDTOApproachChoiceEnum.be_approached:
                return i18n.t(TR.youAreLiveBeApproachedDescr);
                break;
        }
    };

    return (
        <View style={[props.style, { alignItems: "center" }]}>
            <Switch
                testID={TestData.main.goLiveBtn}
                trackColor={{ false: Color.lightGray, true: Color.primary }}
                thumbColor={
                    state.dateMode === UserPrivateDTODateModeEnum.live
                        ? Color.white
                        : Color.lightGray
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={state.dateMode === UserPrivateDTODateModeEnum.live}
            />
            <Text
                style={{ marginTop: 5, fontSize: 12, color: Color.gray }}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
            >
                {state.dateMode === UserPrivateDTODateModeEnum.live
                    ? i18n.t(TR.live)
                    : i18n.t(TR.ghostMode)}
            </Text>
        </View>
    );
};
