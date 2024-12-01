import { Color } from "@/GlobalStyles";
import {
    UpdateUserDTO,
    UserPrivateDTOApproachChoiceEnum,
    UserPrivateDTODateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { OBackgroundLocationService } from "@/tasks/location.task";
import { TestData } from "@/tests/src/accessors";
import { API } from "@/utils/api-config";
import * as Sentry from "@sentry/react-native";
import React, { useEffect } from "react";
import { StyleProp, Switch, Text, View, ViewStyle } from "react-native";

interface IOGoLiveToggleProps {
    style?: StyleProp<ViewStyle>;
}

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const { dispatch, state } = useUserContext();

    useEffect(() => {
        if (state.dateMode !== UserPrivateDTODateModeEnum.live) {
            OBackgroundLocationService.getInstance().stop();
            return;
        }

        OBackgroundLocationService.getInstance().start();
    }, []);

    const configureLocationTracking = async (
        newDateMode: UserPrivateDTODateModeEnum,
    ) => {
        if (newDateMode === UserPrivateDTODateModeEnum.live) {
            await OBackgroundLocationService.getInstance().start();
        } else {
            try {
                await OBackgroundLocationService.getInstance().stop();
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
