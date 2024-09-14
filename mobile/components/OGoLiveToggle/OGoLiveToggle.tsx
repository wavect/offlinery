import { Color } from "@/GlobalStyles";
import {
    LocationUpdateDTO,
    UpdateUserDTO,
    UserApi,
    UserApproachChoiceEnum,
    UserDateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
} from "@/services/secure-storage.service";
import { getLocallyStoredUserData } from "@/services/storage.service";
import { StyledText } from "@/styles/Text.styles";
import { includeJWT } from "@/utils/misc.utils";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React from "react";
import { StyleProp, Switch, View, ViewStyle } from "react-native";

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
        const userApi = new UserApi();

        if (locations && locations.length > 0 && userId) {
            const location = locations[locations.length - 1];
            const locationUpdateDTO: LocationUpdateDTO = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            try {
                await userApi.userControllerUpdateLocation(
                    {
                        userId,
                        locationUpdateDTO: locationUpdateDTO,
                    },
                    await includeJWT(),
                );
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

    const configureLocationTracking = async (newDateMode: UserDateModeEnum) => {
        if (newDateMode === UserDateModeEnum.live) {
            const { status } =
                await Location.requestBackgroundPermissionsAsync();
            if (status === "granted" && state.id) {
                console.log(`Live mode: Starting task ${LOCATION_TASK_NAME}`);
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 5000,
                    distanceInterval: 10,
                    foregroundService: {
                        notificationTitle: "Background location use",
                        notificationBody:
                            "Tracking your location in the background.",
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

            const newDateMode: UserDateModeEnum =
                state.dateMode === UserDateModeEnum.ghost
                    ? UserDateModeEnum.live
                    : UserDateModeEnum.ghost;
            const userApi = new UserApi();
            const updateUserDTO: UpdateUserDTO = {
                dateMode: newDateMode,
            };

            await userApi.userControllerUpdateUser(
                {
                    userId: state.id!,
                    user: updateUserDTO,
                },
                await includeJWT(),
            );

            dispatch({
                type: EACTION_USER.UPDATE_MULTIPLE,
                payload: {
                    dateMode: newDateMode,
                },
            });

            await configureLocationTracking(newDateMode);

            // Load location and inform user about state
            if (newDateMode === UserDateModeEnum.live) {
                alert(`${i18n.t(TR.youAreLive)} ${getSuccessMessage()}`);
            } else {
                alert(i18n.t(TR.ghostModeDescr));
            }
        } catch (error) {
            console.error(
                "Error requesting permissions or saving to backend:",
                error,
            );
            alert(i18n.t(TR.errRequestingPermissions));
        }
    };

    const getSuccessMessage = () => {
        switch (state.approachChoice) {
            case UserApproachChoiceEnum.both:
            case UserApproachChoiceEnum.approach:
                return i18n.t(TR.youAreLiveApproachDescr);
                break;
            case UserApproachChoiceEnum.be_approached:
                return i18n.t(TR.youAreLiveBeApproachedDescr);
                break;
        }
    };

    return (
        <View style={[props.style, { alignItems: "center" }]}>
            <Switch
                trackColor={{ false: Color.lightGray, true: Color.primary }}
                thumbColor={
                    state.dateMode === UserDateModeEnum.live
                        ? Color.white
                        : Color.lightGray
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={state.dateMode === UserDateModeEnum.live}
            />
            <StyledText.XSmall>
                {state.dateMode === UserDateModeEnum.live
                    ? i18n.t(TR.live)
                    : i18n.t(TR.ghostMode)}
            </StyledText.XSmall>
        </View>
    );
};
