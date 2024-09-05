import { Color, Title } from "@/GlobalStyles";
import {
    LocationUpdateDTO,
    NotificationNavigateUserDTO,
    UserApi,
    UserDateModeEnum,
} from "@/api/gen/src";
import { OGoLiveToggle } from "@/components/OGoLiveToggle/OGoLiveToggle";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { registerForPushNotificationsAsync } from "@/services/notification.service";
import {
    SECURE_VALUE,
    getSecurelyStoredValue,
} from "@/services/secure-storage.service";
import { getLocallyStoredUserData } from "@/services/storage.service";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { getJwtHeader } from "@/utils/misc.utils";
import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Subscription } from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import HeatMap from "../../screens/main/HeatMap";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import ProfileSettings from "./ProfileSettings";

const Tab = createBottomTabNavigator();

const LOCATION_TASK_NAME = "background-location-task";

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error(`Task error ${error}`);
        return;
    }
    if (data) {
        const locations = (data as any).locations as Location.LocationObject[];
        const userId = getLocallyStoredUserData()?.id;
        const jwtToken = getSecurelyStoredValue(SECURE_VALUE.JWT_ACCESS_TOKEN);
        if (!userId || !jwtToken) {
            console.error(
                "UserID and/or jwtToken undefined in location task service.",
            );
            return;
        }
        const userApi = new UserApi();

        if (locations && locations.length > 0 && userId) {
            const location = locations[locations.length - 1];
            const locationUpdateDTO: LocationUpdateDTO = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            try {
                await userApi.userControllerUpdateLocation(
                    {
                        userId,
                        locationUpdateDTO: locationUpdateDTO,
                    },
                    getJwtHeader(jwtToken!),
                );
                console.log(
                    `[TASK:LOCATION_UPDATE]: User Location updated successfully`,
                );
            } catch (error) {
                console.error("Error updating location:", error);
            }
        }
    }
});

export const MainScreenTabs = ({ navigation }) => {
    const { state, dispatch } = useUserContext();
    const [unreadNotifications, setUnreadNotifications] = useState<
        Notifications.Notification[]
    >([]);
    const [channels, setChannels] = useState<
        Notifications.NotificationChannel[]
    >([]);
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        // 0 might be a valid ID too
        if (!state.id) {
            console.error(
                i18n.t(TR.noUserIdAssignedCannotListenToNotifications),
            );
        } else {
            registerForPushNotificationsAsync(state.id, state.jwtAccessToken!)
                .then((token) => {
                    if (!token) {
                        console.error(
                            i18n.t(TR.couldNotFetchNotificationToken),
                        );
                        return;
                    }
                })
                .catch(console.error);

            if (Platform.OS === "android") {
                Notifications.getNotificationChannelsAsync().then((value) =>
                    setChannels(value ?? []),
                );
            }

            notificationListener.current =
                Notifications.addNotificationReceivedListener(
                    (notification) => {
                        setUnreadNotifications([
                            ...unreadNotifications,
                            notification,
                        ]);
                        console.log(
                            "Received new notification: ",
                            notification,
                        );
                    },
                );

            responseListener.current =
                Notifications.addNotificationResponseReceivedListener(
                    (response) => {
                        console.log("Notification response", response);
                        // TODO: At some point we might want to send other notifications too? then we need to be more flexible on the typing and checking it
                        const notificationData: NotificationNavigateUserDTO =
                            response.notification.request.content
                                .data as NotificationNavigateUserDTO;

                        // TODO: Move As many types as possible into backend for generation (e.g. PublicUser, Encounter, ..)
                        const encounterProfile: IEncounterProfile = {
                            firstName:
                                notificationData.navigateToPerson.firstName,
                            bio: notificationData.navigateToPerson.bio,
                            imageURIs:
                                notificationData.navigateToPerson.imageURIs,
                            encounterId: notificationData.navigateToPerson.id, // TODO: Is a different ID most likely (relationship ID)
                            age: notificationData.navigateToPerson.age,
                        }; // TODO: FIX union types on backend to be consistent/clean
                        // Navigate to the specified screen, passing the user object as a prop
                        navigation.navigate(ROUTES.Main.Encounters, {
                            screen: notificationData.screen,
                            params: { navigateToPerson: encounterProfile },
                        });
                    },
                );

            return () => {
                notificationListener.current &&
                    Notifications.removeNotificationSubscription(
                        notificationListener.current,
                    );
                responseListener.current &&
                    Notifications.removeNotificationSubscription(
                        responseListener.current,
                    );
            };
        }
    }, [state.id]);

    const [locationStarted, setLocationStarted] = useState(false);
    useEffect(() => {
        (async () => {
            if (state.dateMode === UserDateModeEnum.live) {
                const { status } =
                    await Location.requestBackgroundPermissionsAsync();
                if (status === "granted" && state.id) {
                    console.log(
                        `Live mode: Starting task ${LOCATION_TASK_NAME}`,
                    );
                    await Location.startLocationUpdatesAsync(
                        LOCATION_TASK_NAME,
                        {
                            accuracy: Location.Accuracy.BestForNavigation,
                            timeInterval: 5000,
                            distanceInterval: 10,
                            foregroundService: {
                                notificationTitle: "Background location use",
                                notificationBody:
                                    "Tracking your location in the background.",
                            },
                        },
                    );
                    setLocationStarted(true);
                }
            } else {
                console.log(
                    "Not running location service due to user settings (ghost mode).",
                );
            }
        })();

        return () => {
            if (locationStarted) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        };
    }, [state.dateMode]);

    return (
        <Tab.Navigator
            screenOptions={() => ({
                headerTitle: "",
                headerTitleStyle: Title,
                headerStyle: { height: 110 },
                headerTitleAlign: "left",
                tabBarActiveTintColor: Color.white,
                tabBarLabelStyle: { marginBottom: 5 },
                tabBarActiveBackgroundColor: Color.primary,
                headerShadowVisible: false,
                headerRight: () => (
                    <OGoLiveToggle style={{ marginRight: 10 }} />
                ),
            })}
        >
            <Tab.Screen
                name={ROUTES.Main.FindPeople}
                component={HeatMap}
                options={{
                    tabBarLabel: i18n.t(TR.findPeople),
                    headerTitle: i18n.t(TR.findPeople),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="location-history"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.Main.Encounters}
                component={EncounterScreenStack}
                options={{
                    tabBarLabel: i18n.t(TR.encounters),
                    headerTitle: i18n.t(TR.encounters),
                    tabBarBadge:
                        unreadNotifications.length === 0
                            ? undefined
                            : unreadNotifications.length,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="emoji-people"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.Main.ProfileSettings}
                component={ProfileSettings}
                options={{
                    tabBarLabel: i18n.t(TR.settings),
                    headerTitle: i18n.t(TR.settings),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="settings"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
