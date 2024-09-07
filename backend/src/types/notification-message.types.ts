import { NotificationNavigateUserDTO } from "@/DTOs/notification-navigate-user.dto";
import { ExpoPushMessage } from "expo-server-sdk";

/** @dev Stricter typed Notification type */
export type OfflineryNotification = ExpoPushMessage & {
    data: NotificationNavigateUserDTO;
};
