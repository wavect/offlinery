import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from "react";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import HeatMap from "../../screens/main/HeatMap";
import ProfileSettings from "./ProfileSettings";
import {MaterialIcons} from "@expo/vector-icons";
import {Color, Title} from "../../GlobalStyles";
import {OGoLiveToggle} from "../../components/OGoLiveToggle/OGoLiveToggle";
import {ROUTES} from "../routes";
import * as Notifications from 'expo-notifications';
import {registerForPushNotificationsAsync} from "../../services/notification.service";
import {useEffect, useRef, useState} from "react";
import {EDateMode, useUserContext} from "../../context/UserContext";
import {Subscription} from "expo-notifications";
import {Platform} from "react-native";
import {i18n, TR} from "../../localization/translate.service";
import {LocationUpdateDTO, NotificationNavigateUserDTO, UserApi} from "../../api/gen/src";
import {IEncounterProfile} from "../../types/PublicProfile.types";
import {EncounterScreenStack} from "./EncounterStackNavigator";

const Tab = createBottomTabNavigator();

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }
    if (data) {
        const locations = (data as any).locations as Location.LocationObject[];
        const { state } = useUserContext();
        const userApi = new UserApi();

        if (locations && locations.length > 0 && state.id) {
            const location = locations[locations.length - 1];
            const locationUpdateDTO: LocationUpdateDTO = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            try {
                await userApi.userControllerUpdateLocation({
                    id: state.id,
                    locationUpdateDTO: locationUpdateDTO,
                });
                console.log('Location updated successfully');
            } catch (error) {
                console.error('Error updating location:', error);
            }
        }
    }
});

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

                // TODO: Move As many types as possible into backend for generation (e.g. PublicUser, Encounter, ..)
                const encounterProfile: IEncounterProfile = {
                    firstName: notificationData.navigateToPerson.firstName,
                    bio: notificationData.navigateToPerson.bio,
                    imageURIs: notificationData.navigateToPerson.imageURIs,
                    encounterId: notificationData.navigateToPerson.id, // TODO: Is a different ID most likely (relationship ID)
                    age: notificationData.navigateToPerson.age.toString(),
                }; // TODO: FIX union types on backend to be consistent/clean
                // Navigate to the specified screen, passing the user object as a prop
                navigation.navigate(ROUTES.Main.Encounters, { screen: notificationData.screen, params: { navigateToPerson: encounterProfile } });
            });

            return () => {
                notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
                responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
            };
        }
    }, [state.id]);


    const [locationStarted, setLocationStarted] = useState(false);
    useEffect(() => {
        (async () => {
            if (state.dateMode === EDateMode.LIVE) {
                const {status} = await Location.requestBackgroundPermissionsAsync();
                if (status === 'granted') {
                    // TODO: Only do this if Ghost mode disabled! also set to backend that no matches to be done!
                    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 5000,
                        distanceInterval: 10,
                        foregroundService: {
                            notificationTitle: 'Background location use',
                            notificationBody: 'Tracking your location in the background.',
                        },
                    });
                    setLocationStarted(true);
                }
            } else {
                console.log("Not running location service due to user settings (ghost mode).")
            }
        })();

        return () => {
            if (locationStarted) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        };
    }, [state.dateMode]);


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
