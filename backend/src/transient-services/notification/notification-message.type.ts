import { ExpoPushMessage } from "expo-server-sdk";
import { NotificationNavigateUserDTO } from "../../DTOs/notification-navigate-user.dto";

/** @dev Stricter typed Notification type */
export type OfflineryNotification = ExpoPushMessage & {
    data: NotificationNavigateUserDTO;
};
