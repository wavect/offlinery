import { NotificationAccountApprovedDTO } from "@/DTOs/notifications/notification-account-approved";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { NotificationNewEventDTO } from "@/DTOs/notifications/notification-new-event.dto";
import { ExpoPushMessage } from "expo-server-sdk";

/** @dev Stricter typed Notification type */
export type OfflineryNotification = ExpoPushMessage & {
    /** @dev get rid of any */
    data:
        | NotificationNavigateUserDTO
        | NotificationNewEventDTO
        | NotificationAccountApprovedDTO
        | NotificationGhostReminderDTO
        | any;
};
