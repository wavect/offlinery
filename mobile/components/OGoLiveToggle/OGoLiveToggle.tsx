import { Color } from "@/GlobalStyles";
import {
    UpdateUserDTO,
    UserApi,
    UserApproachChoiceEnum,
    UserDateModeEnum,
} from "@/api/gen/src";
import { EACTION_USER, useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import * as Location from "expo-location";
import { LocationAccuracy } from "expo-location";
import { useState } from "react";
import { StyleProp, Switch, Text, View, ViewStyle } from "react-native";

interface IOGoLiveToggleProps {
    style?: StyleProp<ViewStyle>;
}

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const { dispatch, state } = useUserContext();
    const [isEnabled, setIsEnabled] = useState(false);
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

            const newDateMode: UserDateModeEnum = isEnabled
                ? UserDateModeEnum.live
                : UserDateModeEnum.ghost;
            const userApi = new UserApi();
            const updateUserDTO: UpdateUserDTO = {
                dateMode: newDateMode,
            };

            await userApi.userControllerUpdateUser({
                userId: state.id!,
                user: updateUserDTO,
            });
            console.log("Date mode updated successfully on the backend");

            setIsEnabled((previousState) => !previousState);
            dispatch({
                type: EACTION_USER.SET_DATE_MODE,
                payload: newDateMode,
            });

            // Load location and inform user about state
            if (isEnabled) {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: LocationAccuracy.BestForNavigation,
                });
                dispatch({
                    type: EACTION_USER.SET_CURRENT_LOCATION,
                    payload: location,
                });
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
            case UserApproachChoiceEnum.both: // fall through
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
                thumbColor={isEnabled ? Color.white : Color.lightGray}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
            <Text style={{ marginTop: 5, fontSize: 12, color: Color.gray }}>
                {isEnabled ? i18n.t(TR.live) : i18n.t(TR.ghostMode)}
            </Text>
        </View>
    );
};
