import { User } from "@/entities/user/user.entity";

export interface GhostModeTarget {
    user: ReceivableUser;
    intervalHour: IntervalHour;
}

export interface IntervalHour {
    hours: number;
    translationKey: string;
}

export const DEFAULT_INTERVAL_HOURS: IntervalHour[] = [
    { hours: 24, translationKey: "main.cron.intervalHours.h24" },
    { hours: 72, translationKey: "main.cron.intervalHours.h72" },
    { hours: 336, translationKey: "main.cron.intervalHours.h336" },
];

export type ReceivableUser = Pick<
    User,
    | "email"
    | "pushToken"
    | "preferredLanguage"
    | "firstName"
    | "id"
    | "ghostModeRemindersEmail"
    | "restrictedViewToken"
    | "lastDateModeReminderSent"
>;

export enum TimeSpan {
    ONE_DAY = "ONE_DAY",
    THREE_DAYS = "THREE_DAYS",
    TWO_WEEKS = "TWO_WEEKS",
}

export interface OfflineUserSince {
    user: ReceivableUser;
    type: TimeSpan;
}

export const goBackInTimeFor = (
    value: number,
    unit: "hours" | "days",
): Date => {
    const hours = unit === "days" ? value * 24 : value;
    return new Date(new Date().getTime() - hours * 60 * 60 * 1000);
};

/** @dev String value used for translation keys */
export enum ECronJobType {
    GHOST_MODE_REMINDER = "ghostmode-reminder",
    SAFETY_CALL_REMINDER = "safety-call-booked-reminder",
}
