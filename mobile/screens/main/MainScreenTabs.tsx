import { Color, Title } from "@/GlobalStyles";
import {
    NotificationNavigateUserDTOTypeEnum,
    NotificationNewEventDTOTypeEnum,
} from "@/api/gen/src";
import { OGoLiveToggle } from "@/components/OGoLiveToggle/OGoLiveToggle";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { MainTabs } from "@/screens/main/MainScreenTabs.navigator";
import {
    TokenFetchStatus,
    reactToNewEncounterNotification,
    reactToNewEventNotification,
    registerForPushNotificationsAsync,
} from "@/services/notification.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import { ROUTES } from "../routes";
import { EncounterScreenStack } from "./EncounterStackNavigator";
import FindPeople from "./FindPeople";
import ProfileSettings from "./ProfileSettings";

export const MainScreenTabs = ({ navigation }: any) => {
    const { state, dispatch } = useUserContext();
    const [unreadNotifications, setUnreadNotifications] = useState<
        Notifications.Notification[]
    >([]);
    const [channels, setChannels] = useState<
        Notifications.NotificationChannel[]
    >([]);
    const notificationListener =
        useRef<
            ReturnType<typeof Notifications.addNotificationReceivedListener>
        >();
    const responseListener =
        useRef<
            ReturnType<
                typeof Notifications.addNotificationResponseReceivedListener
            >
        >();
    const setupPerformed = useRef(false);

    // @dev useFocusEffect ensures that the services are only started once the user has been logged in, instead of prompting the user for permissions on the welcome screen due to the AppRoot.tsx route import
    useFocusEffect(
        useCallback(() => {
            const setupNotifications = async () => {
                // @dev should only be executed once during app usage
                if (setupPerformed.current) return;

                // 0 might be a valid ID too
                if (!state.id) {
                    console.error(
                        i18n.t(TR.noUserIdAssignedCannotListenToNotifications),
                    );
                } else {
                    registerForPushNotificationsAsync(state.id)
                        .then((token) => {
                            if (
                                token.tokenFetchStatus ===
                                TokenFetchStatus.ERROR
                            ) {
                                console.error(
                                    i18n.t(TR.couldNotFetchNotificationToken),
                                );
                                return;
                            } else if (
                                token.tokenFetchStatus ===
                                TokenFetchStatus.INVALID_DEVICE_OR_EMULATOR
                            ) {
                                console.info("Emulator | No Expo Push Token");
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            Sentry.captureException(error, {
                                tags: {
                                    notifications: "setup",
                                },
                            });
                        });

                    if (Platform.OS === "android") {
                        Notifications.getNotificationChannelsAsync().then(
                            (value) => setChannels(value ?? []),
                        );
                    }

                    notificationListener.current =
                        Notifications.addNotificationReceivedListener(
                            (notification) => {
                                // TODO: we likely will also need to check for notification type here then
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

                                // Differentiate between different notifications
                                const notificationType =
                                    response.notification.request.content?.data
                                        ?.type; // @dev defined through backend side abstract class

                                if (!notificationType) {
                                    Sentry.captureException(
                                        new Error(
                                            "No notification type found in notification.",
                                        ),
                                        {
                                            tags: {
                                                notificationService:
                                                    "MainScreenTabs:invalid notification",
                                                notification: JSON.stringify(
                                                    response.notification
                                                        .request.content
                                                        ?.data ?? {},
                                                ),
                                            },
                                        },
                                    );
                                    navigation.navigate(ROUTES.MainTabView, {
                                        screen: ROUTES.Main.FindPeople, // default
                                    });
                                    return;
                                }

                                switch (notificationType) {
                                    case NotificationNewEventDTOTypeEnum.event:
                                        reactToNewEventNotification(
                                            response,
                                            navigation,
                                        );
                                        break;
                                    case NotificationNavigateUserDTOTypeEnum.match:
                                        // @dev Remove notification from array to update the "unread notification" bubble in the tab
                                        const filteredNotifications =
                                            unreadNotifications.filter(
                                                (n) =>
                                                    n.request.identifier !==
                                                    response.notification
                                                        .request.identifier,
                                            );
                                        setUnreadNotifications(
                                            filteredNotifications,
                                        );
                                        reactToNewEncounterNotification(
                                            response,
                                            navigation,
                                        );
                                        break;
                                    default:
                                        Sentry.captureException(
                                            new Error(
                                                "Received unknown notification type - app version cannot handle it yet.",
                                            ),
                                            {
                                                tags: {
                                                    notificationService:
                                                        "MainScreenTabs: unsupported notification type",
                                                    notificationType,
                                                    notification:
                                                        JSON.stringify(
                                                            response
                                                                .notification
                                                                .request.content
                                                                ?.data ?? {},
                                                        ),
                                                },
                                            },
                                        );
                                        navigation.navigate(
                                            ROUTES.MainTabView,
                                            {
                                                screen: ROUTES.Main.FindPeople, // default
                                            },
                                        );
                                }
                            },
                        );

                    setupPerformed.current = true;
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
                name={ROUTES.Main.EncountersTab}
                component={EncounterScreenStack}
                options={{
                    tabBarLabel: i18n.t(TR.encounters),
                    headerTitle: i18n.t(TR.encounters),
                    // tabBarBadge:
                    // unreadNotifications.length === 0
                    //     ? undefined
                    //     : unreadNotifications.length,
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
