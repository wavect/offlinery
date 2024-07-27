import {useEffect, useState} from "react";
import {Switch} from "react-native";
import {Color} from "../../GlobalStyles";
import * as Location from "expo-location";
import {LocationAccuracy} from "expo-location";

export const OGoLiveToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);
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
        } catch (error) {
        console.error("Error requesting permissions:", error);
        alert('An error occurred while requesting permissions');
    }
    }

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({accuracy: LocationAccuracy.BestForNavigation});
            setLocation(location);
        })();
    }, []);


    return <Switch
        trackColor={{false: Color.lightGray, true: Color.primary}}
        thumbColor={isEnabled ? Color.white : Color.lightGray}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
    />
}