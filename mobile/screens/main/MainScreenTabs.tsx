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
import * as Notifications from 'expo-notifications';
import {EncountersProvider} from "../../context/EncountersContext";
import NavigateToApproach from "./NavigateToApproach";
import {registerForPushNotificationsAsync} from "../../services/notification.service";
import {useEffect, useRef, useState} from "react";
import {useUserContext} from "../../context/UserContext";
import {Subscription} from "expo-notifications";
import {Platform} from "react-native";
import ProfileView from "./ProfileView";
import {useNavigationState} from "@react-navigation/native";

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
        <EncounterStack.Screen
            name={ROUTES.Main.ProfileView}
            component={ProfileView}
            options={{
                headerShown: true,
                headerShadowVisible: false,
                headerTitle: "Profile view",
                headerBackTitleVisible: false,
                headerTitleAlign: 'left'
            }}
        />
    </EncounterStack.Navigator>
</EncountersProvider>

export const MainScreenTabs = () => {
    const {state, dispatch} = useUserContext()
    const [unreadNotifications, setUnreadNotifications] = useState<Notifications.Notification[]>([]);
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        // 0 might be a valid ID too
        if (!state.id && state.id !== 0) {
            console.error('No user ID assigned! Cannot listen to notifications')
        } else {
            registerForPushNotificationsAsync(state.id).then(token => {
                if (!token) {
                    console.error('Could not fetch notification token.')
                    return;
                }
            }).catch(console.error);

            if (Platform.OS === 'android') {
                Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
            }

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setUnreadNotifications([...unreadNotifications, notification]);
                console.log("Received new notification: ", notification)
                // TODO handle
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log("Notification response", response);
                // TODO handle
                // Handle notification response (e.g., navigate to a specific screen)
            });

            return () => {
                notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
                responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
            };
        }
    }, [state.id]);


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
                headerRight: () => <OGoLiveToggle style={{marginRight: 10}}/>,
            })
        }>
        <Tab.Screen name={ROUTES.Main.FindPeople} component={HeatMap} options={{
            tabBarLabel: 'Find people',
            headerTitle: 'Find people',
            tabBarIcon: ({color, size}) => <MaterialIcons name="location-history" size={size} color={color}/>
        }}/>
        <Tab.Screen name={ROUTES.Main.Encounters} component={EncounterScreenStack} options={{
            tabBarLabel: 'Encounters',
            headerTitle: 'Encounters',
            tabBarBadge: unreadNotifications.length === 0 ? undefined : unreadNotifications.length,
            tabBarIcon: ({color, size}) => <MaterialIcons name="emoji-people" size={size} color={color}/>
        }}/>
        <Tab.Screen name={ROUTES.Main.ProfileSettings} component={ProfileSettings} options={{
            tabBarLabel: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({color, size}) => <MaterialIcons name="settings" size={size} color={color}/>
        }}/>
    </Tab.Navigator>
}
