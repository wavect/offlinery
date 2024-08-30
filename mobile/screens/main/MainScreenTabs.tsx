import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import { Subscription } from "expo-notifications";
import * as React from "react";
import { memo, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Color, Title } from "../../GlobalStyles";
import { NotificationNavigateUserDTO } from "../../api/gen/src";
import { OGoLiveToggle } from "../../components/OGoLiveToggle/OGoLiveToggle";
import { EncountersProvider } from "../../context/EncountersContext";
import { useUserContext } from "../../context/UserContext";
import { i18n, TR } from "../../localization/translate.service";
import HeatMap from "../../screens/main/HeatMap";
import { registerForPushNotificationsAsync } from "../../services/notification.service";
import { IEncounterProfile } from "../../types/PublicProfile.types";
import { getAge } from "../../utils/date.utils";
import { ROUTES } from "../routes";
import Encounters from "./Encounters";
import NavigateToApproach from "./NavigateToApproach";
import ProfileSettings from "./ProfileSettings";
import ProfileView from "./ProfileView";
import ReportEncounter from "./ReportEncounter";

const Tab = createBottomTabNavigator();
const EncounterStack = createStackNavigator();

interface IEncounterStackProps {
    route?: {
        params?: {
            initialRouteName?: string;
        };
    };
}

const NO_HEADER = { headerShown: false };
const EncounterScreenStack = memo(({ route }: IEncounterStackProps) => {
    const initialRouteName =
        route?.params?.initialRouteName ?? ROUTES.Main.Encounters;
    return (
        <EncountersProvider>
            <EncounterStack.Navigator
                initialRouteName={initialRouteName}
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
                        headerTitleAlign: "left",
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
                        headerTitleAlign: "left",
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
                        headerTitleAlign: "left",
                    }}
                />
            </EncounterStack.Navigator>
        </EncountersProvider>
    );
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
            registerForPushNotificationsAsync(state.id)
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
                            age: getAge(
                                notificationData.navigateToPerson.birthDay,
                            ).toString(), // TODO: calc on backend and only return age
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
