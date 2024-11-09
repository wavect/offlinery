import { OfflineryNotification } from "@/types/notification-message.types";

export type OBaseNewMatchNotification = Omit<
    OfflineryNotification,
    "to" | "data"
> & {
    data: Pick<
        OfflineryNotification["data"],
        Exclude<keyof OfflineryNotification["data"], "encounterId">
    >;
};
