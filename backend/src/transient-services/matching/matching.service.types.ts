import { BaseNotificationADTO } from "@/DTOs/abstract/base-notification.adto";
import { OfflineryNotification } from "@/types/notification-message.types";

export type OBaseNewMatchNotification = Omit<
    OfflineryNotification,
    "to" | "data"
> & {
    data: BaseNotificationADTO;
};
