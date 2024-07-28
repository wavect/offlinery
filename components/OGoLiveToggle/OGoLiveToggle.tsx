import {useEffect, useState} from "react";
import {StyleProp, Switch, Text, View, ViewStyle} from "react-native";
import {Color} from "../../GlobalStyles";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";
import {EACTION_USER, EApproachChoice, EDateMode, useUserContext} from "../../context/UserContext";

interface IOGoLiveToggleProps {
    style?: StyleProp<ViewStyle>;
}

export const OGoLiveToggle = (props: IOGoLiveToggleProps) => {
    const {dispatch, state} = useUserContext()
    const [isEnabled, setIsEnabled] = useState(false)
    const toggleSwitch = async () => {
        try {
            const {status: fStatus} = await Location.requestForegroundPermissionsAsync();
            console.log("status...", fStatus)
            if (fStatus !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }
            const {status: bStatus} = await Location.requestBackgroundPermissionsAsync();
            console.log("status2", bStatus)

            if (bStatus !== 'granted') {
                alert('Permission to access location in background was denied');
                return;
            }
            setIsEnabled(previousState => !previousState);
            dispatch({type: EACTION_USER.SET_DATE_MODE, payload: isEnabled ? EDateMode.LIVE : EDateMode.GHOST})
        } catch (error) {
            console.error("Error requesting permissions:", error);
            alert('An error occurred while requesting permissions');
        }
    }

    const getSuccessMessage = () => {
        switch(state.approachChoice) {
            case EApproachChoice.BOTH: // fall through
            case EApproachChoice.APPROACH:
                return 'You will receive notifications when someone interesting is nearby!'
                break;
            case EApproachChoice.BE_APPROACHED:
                return 'People you may find interesting will receive notifications when you are nearby!'
                break;
        }
    }

    useEffect(() => {
        if (isEnabled) {
            (async () => {
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.BestForNavigation});
                dispatch({type: EACTION_USER.SET_CURRENT_LOCATION, payload: location})
                alert(`You are live! ${getSuccessMessage()}`)
            })();
        } else {
            alert('Ghost mode. Nobody will see you! Press the toggle on the top to go live.')
        }
    }, []);


    return (
        <View style={[props.style, { alignItems: 'center' }]}>
            <Switch
                trackColor={{false: Color.lightGray, true: Color.primary}}
                thumbColor={isEnabled ? Color.white : Color.lightGray}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
            <Text style={{ marginTop: 5, fontSize: 12, color: Color.gray }}>
                {isEnabled ? 'Live' : 'Ghost Mode'}
            </Text>
        </View>
    );
}