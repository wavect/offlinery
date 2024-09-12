import { Color, Title } from "@/GlobalStyles";
import { MainStackParamList } from "@/MainStack.navigator";
import { NotificationNavigateUserDTO } from "@/api/gen/src";
import { OGoLiveToggle } from "@/components/OGoLiveToggle/OGoLiveToggle";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { EncounterStackParamList } from "@/screens/main/EncounterStack.navigator";
import {
    MainScreenTabsParamList,
    MainTabs,
} from "@/screens/main/MainScreenTabs.navigator";
import { registerForPushNotificationsAsync } from "@/services/notification.service";
import { IEncounterProfile } from "@/types/PublicProfile.types";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Subscription } from "expo-notifications";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { NativeStackScreenProps } from "react-native-screens/native-stack";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import FindPeople from "./FindPeople";
import ProfileSettings from "./ProfileSettings";

export const MainScreenTabs = ({
    navigation,
}: BottomTabScreenProps<MainScreenTabsParamList, typeof ROUTES.MainTabView> &
    NativeStackScreenProps<MainStackParamList, typeof ROUTES.MainTabView> &
    NativeStackScreenProps<
        EncounterStackParamList,
        typeof ROUTES.Main.Encounters
    >) => {
    const { state, dispatch } = useUserContext();
    const [unreadNotifications, setUnreadNotifications] = useState<
        Notifications.Notification[]
    >([]);
    const [channels, setChannels] = useState<
        Notifications.NotificationChannel[]
    >([]);
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    // @dev useFocusEffect ensures that the services are only started once the user has been logged in, instead of prompting the user for permissions on the welcome screen due to the App.tsx route import
    useFocusEffect(
        useCallback(() => {
            const setupNotifications = async () => {
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
                        Notifications.getNotificationChannelsAsync().then(
                            (value) => setChannels(value ?? []),
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
                                // @dev Remove notification from array to update the "unread notification" bubble in the tab
                                const filteredNotifications =
                                    unreadNotifications.filter(
                                        (n) =>
                                            n.request.identifier !==
                                            response.notification.request
                                                .identifier,
                                    );
                                setUnreadNotifications(filteredNotifications);

                                console.log("Notification response", response);
                                // TODO: At some point we might want to send other notifications too? then we need to be more flexible on the typing and checking it
                                const notificationData: NotificationNavigateUserDTO =
                                    response.notification.request.content
                                        .data as NotificationNavigateUserDTO;

                                // TODO: Move As many types as possible into backend for generation (e.g. PublicUser, Encounter, ..)
                                const encounterProfile: IEncounterProfile = {
                                    firstName:
                                        notificationData.navigateToPerson
                                            .firstName,
                                    bio: notificationData.navigateToPerson.bio,
                                    imageURIs:
                                        notificationData.navigateToPerson
                                            .imageURIs,
                                    encounterId:
                                        notificationData.navigateToPerson.id, // TODO: Is a different ID most likely (relationship ID)
                                    age: notificationData.navigateToPerson.age,
                                };
                                // Navigate to the specified screen, passing the user object as a prop
                                navigation.navigate(ROUTES.MainTabView, {
                                    screen: notificationData.screen,
                                    params: {
                                        navigateToPerson: encounterProfile,
                                    },
                                });
                            },
                        );
                }
            };

            setupNotifications();

            return () => {
                if (notificationListener.current) {
                    Notifications.removeNotificationSubscription(
                        notificationListener.current,
                    );
                }
                if (responseListener.current) {
                    Notifications.removeNotificationSubscription(
                        responseListener.current,
                    );
                }
            };
        }, [state.id, state.dateMode]),
    );

    return (
        <MainTabs.Navigator
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
            <MainTabs.Screen
                name={ROUTES.Main.FindPeople}
                component={FindPeople}
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
                    tabBarTestID: "tab-find-people",
                }}
            />
            <MainTabs.Screen
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
                    tabBarTestID: "tab-encounters",
                }}
            />
            <MainTabs.Screen
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
                    tabBarTestID: "tab-settings",
                }}
            />
        </MainTabs.Navigator>
    );
};
