import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from "react";
import HeatMap from "../../screens/main/HeatMap";
import Encounters from "./Encounters";
import Settings from "./Settings";
import {MaterialIcons} from "@expo/vector-icons";
import {Color, Title} from "../../GlobalStyles";
import {OGoLiveToggle} from "../../components/OGoLiveToggle/OGoLiveToggle";
import {Text} from "react-native";

const Tab = createBottomTabNavigator();

export const MainScreenTabs = () => {
    return <Tab.Navigator
        screenOptions={{ headerTitleStyle: Title,
            headerStyle: { height: 110 }, headerTitleAlign: 'left',
            tabBarActiveTintColor: Color.white, tabBarLabelStyle: {marginBottom: 5},
            tabBarActiveBackgroundColor: Color.primary, headerShadowVisible: false, headerRight: () => <OGoLiveToggle style={{marginRight: 10}} />}}>
        <Tab.Screen name="Find People" component={HeatMap} options={{
            tabBarIcon: ({color, size}) => <MaterialIcons name="location-history" size={size} color={color}/>
        }}/>
        {/* TODO: We could add badges to encounters, https://reactnavigation.org/docs/tab-based-navigation */}
        <Tab.Screen name="Encounters" component={Encounters} options={{
            tabBarIcon: ({color, size}) => <MaterialIcons name="emoji-people" size={size} color={color}/>
        }}/>
        <Tab.Screen name="Settings" component={Settings} options={{
            tabBarIcon: ({color, size}) => <MaterialIcons name="settings" size={size} color={color}/>
        }}/>
    </Tab.Navigator>
}
