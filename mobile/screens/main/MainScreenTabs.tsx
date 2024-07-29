import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from "react";
import HeatMap from "../../screens/main/HeatMap";
import Encounters from "./Encounters";
import ProfileSettings from "./ProfileSettings";
import {MaterialIcons} from "@expo/vector-icons";
import {Color, Title} from "../../GlobalStyles";
import {OGoLiveToggle} from "../../components/OGoLiveToggle/OGoLiveToggle";
import {createStackNavigator} from "@react-navigation/stack";
import {ROUTES} from "../routes";
import ReportEncounter from "./ReportEncounter";
import {useNavigationState} from "@react-navigation/native";
import {EncountersProvider} from "../../context/EncountersContext";
import NavigateToApproach from "./NavigateToApproach";

const Tab = createBottomTabNavigator();
const EncounterStack = createStackNavigator();

const NO_HEADER = {headerShown: false}
const EncounterScreenStack = () => <EncountersProvider>
    <EncounterStack.Navigator
        initialRouteName={ROUTES.Main.Encounters}
        screenOptions={NO_HEADER}
    >
        <EncounterStack.Screen
            name={ROUTES.Main.Encounters}
            component={Encounters}
            options={NO_HEADER}
        />
        <EncounterStack.Screen
            name={ROUTES.Main.ReportEncounter}
            component={ReportEncounter}
            options={{
                headerShown: true,
                headerShadowVisible: false,
                headerTitle: "Report person",
                headerBackTitleVisible: false,
                headerTitleAlign: 'left'
            }}
        />
        <EncounterStack.Screen
            name={ROUTES.Main.NavigateToApproach}
            component={NavigateToApproach}
            options={{
                headerShown: true,
                headerShadowVisible: false,
                headerTitle: "Meet in IRL",
                headerBackTitleVisible: false,
                headerTitleAlign: 'left'
            }}
        />
    </EncounterStack.Navigator>
</EncountersProvider>

export const MainScreenTabs = () => {
    return <Tab.Navigator
        screenOptions={() => (
            {
                headerTitle: '',
                headerTitleStyle: Title,
                headerStyle: {height: 110},
                headerTitleAlign: 'left',
                tabBarActiveTintColor: Color.white,
                tabBarLabelStyle: {marginBottom: 5},
                tabBarActiveBackgroundColor: Color.primary,
                headerShadowVisible: false,
                headerRight: () => <OGoLiveToggle style={{marginRight: 10}}/>
            })
        }>
        <Tab.Screen name={ROUTES.Main.FindPeople} component={HeatMap} options={{
            tabBarLabel: 'Find people',
            headerTitle: 'Find people',
            tabBarIcon: ({color, size}) => <MaterialIcons name="location-history" size={size} color={color}/>
        }}/>
        {/* TODO: We could add badges to encounters, https://reactnavigation.org/docs/tab-based-navigation */}
        <Tab.Screen name={ROUTES.Main.Encounters} component={EncounterScreenStack} options={{
            tabBarLabel: 'Encounters',
            headerTitle: 'Encounters',
            tabBarIcon: ({color, size}) => <MaterialIcons name="emoji-people" size={size} color={color}/>
        }}/>
        <Tab.Screen name={ROUTES.Main.ProfileSettings} component={ProfileSettings} options={{
            tabBarLabel: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({color, size}) => <MaterialIcons name="settings" size={size} color={color}/>
        }}/>
    </Tab.Navigator>
}
