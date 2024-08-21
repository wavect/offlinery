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
import {i18n, TR} from "../../localization/translate.service";
import {NotificationNavigateUserDTO} from "../../api/gen/src";

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
                headerTitle: i18n.t(TR.reportPerson),
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
                headerTitle: i18n.t(TR.meetIRL),
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
                headerTitle: i18n.t(TR.profileView),
                headerBackTitleVisible: false,
                headerTitleAlign: 'left'
            }}
        />
    </EncounterStack.Navigator>
</EncountersProvider>

export const MainScreenTabs = ({navigation}) => {
    const {state, dispatch} = useUserContext()
    const [unreadNotifications, setUnreadNotifications] = useState<Notifications.Notification[]>([]);
    const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        // 0 might be a valid ID too
        if (!state.id) {
            console.error(i18n.t(TR.noUserIdAssignedCannotListenToNotifications))
        } else {
            registerForPushNotificationsAsync(state.id).then(token => {
                if (!token) {
                    console.error(i18n.t(TR.couldNotFetchNotificationToken))
                    return;
                }
            }).catch(console.error);

            if (Platform.OS === 'android') {
                Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
            }

            notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
                setUnreadNotifications([...unreadNotifications, notification]);
                console.log("Received new notification: ", notification)
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                console.log("Notification response", response);
                // TODO: At some point we might want to send other notifications too? then we need to be more flexible on the typing and checking it
                const notificationData: NotificationNavigateUserDTO = response.notification.request.content.data as NotificationNavigateUserDTO;
                // Navigate to the specified screen, passing the user object as a prop
                navigation.navigate(notificationData.screen, { navigateToPerson: notificationData.navigateToPerson });

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
            tabBarLabel: i18n.t(TR.findPeople),
            headerTitle: i18n.t(TR.findPeople),
            tabBarIcon: ({color, size}) => <MaterialIcons name="location-history" size={size} color={color}/>
        }}/>
        <Tab.Screen name={ROUTES.Main.Encounters} component={EncounterScreenStack} options={{
            tabBarLabel: i18n.t(TR.encounters),
            headerTitle: i18n.t(TR.encounters),
            tabBarBadge: unreadNotifications.length === 0 ? undefined : unreadNotifications.length,
            tabBarIcon: ({color, size}) => <MaterialIcons name="emoji-people" size={size} color={color}/>
        }}/>
        <Tab.Screen name={ROUTES.Main.ProfileSettings} component={ProfileSettings} options={{
            tabBarLabel: i18n.t(TR.settings),
            headerTitle: i18n.t(TR.settings),
            tabBarIcon: ({color, size}) => <MaterialIcons name="settings" size={size} color={color}/>
        }}/>
    </Tab.Navigator>
}
