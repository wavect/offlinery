import { NotificationAccountApprovedDTO } from "@/DTOs/notifications/notification-account-approved";
import { NotificationDidYouMeetDTO } from "@/DTOs/notifications/notification-did-you-meet";
import { NotificationGhostReminderDTO } from "@/DTOs/notifications/notification-ghostreminder.dto";
import { NotificationNavigateUserDTO } from "@/DTOs/notifications/notification-navigate-user.dto";
import { NotificationNewEventDTO } from "@/DTOs/notifications/notification-new-event.dto";
import { NotificationNewMessageDTO } from "@/DTOs/notifications/notification-new-message.dto";
import { NotificationSafetyCallMissedDTO } from "@/DTOs/notifications/notification-safetycall-missed.dto";
import { ExpoPushMessage } from "expo-server-sdk";

/** @dev Stricter typed Notification type */
export type OfflineryNotification = Omit<ExpoPushMessage, "data"> & {
    data:
        | NotificationNavigateUserDTO
        | NotificationNewEventDTO
        | NotificationNewMessageDTO
        | NotificationSafetyCallMissedDTO
        | NotificationDidYouMeetDTO
        | NotificationAccountApprovedDTO
        | NotificationGhostReminderDTO;
};
