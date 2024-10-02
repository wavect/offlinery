import { OfflineryNotification } from "@/types/notification-message.types";

export type OBaseNotification = Omit<OfflineryNotification, "to" | "data"> & {
    data: Pick<
        OfflineryNotification["data"],
        Exclude<keyof OfflineryNotification["data"], "encounterId">
    >;
};
