import {
    LocationUpdateDTO,
    UpdateUserDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { Color } from "@/GlobalStyles";
import { TR, i18n } from "@/localization/translate.service";
import { getLocallyStoredUserData } from "@/services/storage.service";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React, { useState } from "react";
import {
    Platform,
    StyleProp,
    Switch,
    Text,
    View,
    ViewStyle,
} from "react-native";

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
        if (!userId) {
            console.error("UserID undefined in location task service.");
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
    const [notificationId, setNotificationId] = useState<string>();

    const sendLocationNotification = async () => {
        if (Platform.OS === "ios") {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: i18n.t(TR.bgLocationServiceTitle),
                    body: i18n.t(TR.bgLocationServiceBody),
                },
                trigger: null,
            });
            setNotificationId(id);
        }
    };
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
                await sendLocationNotification();
            }
        } else {
            try {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
                if (notificationId) {
                    await Notifications.dismissNotificationAsync(
                        notificationId,
                    );
                }
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
            const newDateMode: UserPrivateDTODateModeEnum =
                state.dateMode === UserPrivateDTODateModeEnum.ghost
                    ? UserPrivateDTODateModeEnum.live
                    : UserPrivateDTODateModeEnum.ghost;

            if (newDateMode === UserPrivateDTODateModeEnum.live) {
                const foregroundPermissions =
                    await Location.requestForegroundPermissionsAsync();
                if (foregroundPermissions.status === "granted") {
                    const { granted } =
                        await Location.requestBackgroundPermissionsAsync();
                    if (!granted) {
                        alert(i18n.t(TR.permissionToBackgroundLocationDenied));
                        return;
                    }
                } else {
                    alert(i18n.t(TR.permissionToBackgroundLocationDenied));
                    return;
                }
            }

            const updateUserDTO: UpdateUserDTO = { dateMode: newDateMode };

            await API.user.userControllerUpdateUser({
                userId: state.id!,
                updateUserDTO,
            });

            await configureLocationTracking(newDateMode);

            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: { dateMode: newDateMode },
            });

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
