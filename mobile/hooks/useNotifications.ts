import { NotificationNavigateUserDTOTypeEnum } from "@/api/gen/src";
import { useUserContext } from "@/context/UserContext";
import { TR, i18n } from "@/localization/translate.service";
import { ROUTES } from "@/screens/routes";
import {
    TokenFetchStatus,
    reactToNewEncounterNotification,
    registerForPushNotificationsAsync,
} from "@/services/notification.service";
import { useFocusEffect } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

interface IUseNotificationProps {
    navigation: any;
}

export const useNotifications = ({ navigation }: IUseNotificationProps) => {
    const { state } = useUserContext();
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
                                    navigation.navigate(ROUTES.MainTabView, {
                                        screen: ROUTES.Main.FindPeople, // default
                                    });
                                    return;
                                }

                                switch (notificationType) {
                                    case NotificationNavigateUserDTOTypeEnum.new_match:
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
                                        // @dev other notifications have this default behavior, if we want a different behavior just add above.
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
};
