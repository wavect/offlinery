import { NotificationAccountApprovedDTO } from "@/DTOs/notifications/notification-account-approved";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { NotificationNewEventDTO } from "@/DTOs/notifications/notification-new-event.dto";
import { NotificationNewMessageDTO } from "@/DTOs/notifications/notification-new-message.dto";
import { ExpoPushMessage } from "expo-server-sdk";

/** @dev Stricter typed Notification type */
export type OfflineryNotification = Omit<ExpoPushMessage, "data"> & {
    /** @dev get rid of any */
    data:
        | NotificationNavigateUserDTO
        | NotificationNewEventDTO
        | NotificationNewMessageDTO
        | NotificationAccountApprovedDTO
        | NotificationGhostReminderDTO;
};
