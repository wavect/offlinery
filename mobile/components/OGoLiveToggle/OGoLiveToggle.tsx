import { Color } from "@/GlobalStyles";
import {
    UpdateUserDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import {
    LOCATION_TASK_NAME,
    stopLocationBackgroundTask,
} from "@/tasks/location.task";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import { showOpenAppSettingsAlert } from "@/utils/misc.utils";
import * as Sentry from "@sentry/react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React, { useEffect } from "react";
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

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const { dispatch, state } = useUserContext();

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

    useEffect(() => {
        async function startLocationTask() {
            const taskStatus =
                await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (!taskStatus) {
                configureLocationTracking(state.dateMode);
            }
        }

        if (state.dateMode !== UserPrivateDTODateModeEnum.live) {
            return;
        }
        startLocationTask();
    }, []);

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
                await stopLocationBackgroundTask();

                if (Platform.OS === "ios") {
                    const allNotifications =
                        await Notifications.getPresentedNotificationsAsync();
                    for (
                        let index = 0;
                        index < allNotifications.length;
                        index++
                    ) {
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
            } catch (err) {
                console.error(err);
                Sentry.captureException(err, {
                    tags: {
                        location_service: "startBackgroundLocationTracking",
                    },
                });
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
                        showOpenAppSettingsAlert(
                            i18n.t(TR.permissionToBackgroundLocationDenied),
                        );
                        return;
                    }
                } else {
                    showOpenAppSettingsAlert(
                        i18n.t(TR.permissionToBackgroundLocationDenied),
                    );
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
            Sentry.captureException(error, {
                tags: {
                    location_service: "switchLocationToggle",
                },
            });
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
