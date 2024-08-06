import {useEffect, useState} from "react";
import {StyleProp, Switch, Text, View, ViewStyle} from "react-native";
import {Color} from "../../GlobalStyles";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";
import {EACTION_USER, EApproachChoice, EDateMode, useUserContext} from "../../context/UserContext";
import {i18n, TR} from "../../localization/translate.service";

interface IOGoLiveToggleProps {
    style?: StyleProp<ViewStyle>;
}

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const {dispatch, state} = useUserContext()
    const [isEnabled, setIsEnabled] = useState(false)
    const toggleSwitch = async () => {
        try {
            const {status: fStatus} = await Location.requestForegroundPermissionsAsync();
            if (fStatus !== 'granted') {
                alert(i18n.t(TR.permissionToLocationDenied));
                return;
            }
            const {status: bStatus} = await Location.requestBackgroundPermissionsAsync();

            if (bStatus !== 'granted') {
                alert(i18n.t(TR.permissionToBackgroundLocationDenied));
                return;
            }
            setIsEnabled(previousState => !previousState);
            dispatch({type: EACTION_USER.SET_DATE_MODE, payload: isEnabled ? EDateMode.LIVE : EDateMode.GHOST})

            // Load location and inform user about state
            if (isEnabled) {
                const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.BestForNavigation});
                dispatch({type: EACTION_USER.SET_CURRENT_LOCATION, payload: location})
                alert(`${i18n.t(TR.youAreLive)} ${getSuccessMessage()}`)
            } else {
                alert(i18n.t(TR.ghostModeDescr))
            }
        } catch (error) {
            console.error("Error requesting permissions:", error);
            alert(i18n.t(TR.errRequestingPermissions));
        }
    }

    const getSuccessMessage = () => {
        switch (state.approachChoice) {
            case EApproachChoice.BOTH: // fall through
            case EApproachChoice.APPROACH:
                return i18n.t(TR.youAreLiveApproachDescr)
                break;
            case EApproachChoice.BE_APPROACHED:
                return i18n.t(TR.youAreLiveBeApproachedDescr)
                break;
        }
    }

    return (
        <View style={[props.style, {alignItems: 'center'}]}>
            <Switch
                trackColor={{false: Color.lightGray, true: Color.primary}}
                thumbColor={isEnabled ? Color.white : Color.lightGray}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
            <Text style={{marginTop: 5, fontSize: 12, color: Color.gray}}>
                {isEnabled ? i18n.t(TR.live) : i18n.t(TR.ghostMode)}
            </Text>
        </View>
    );
}