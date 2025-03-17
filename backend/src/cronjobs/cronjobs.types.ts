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
    unit: "hours" | "days" | "months" | "years",
): Date => {
    const now = new Date();
    switch (unit) {
        case "hours":
            return new Date(now.getTime() - value * 60 * 60 * 1000);
        case "days":
            return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
        case "months": {
            const date = new Date(now);
            date.setMonth(date.getMonth() - value);
            return date;
        }
        case "years": {
            const date = new Date(now);
            date.setFullYear(date.getFullYear() - value);
            return date;
        }
    }
};

/** @dev String value used for translation keys */
export enum ECronJobType {
    GHOST_MODE_REMINDER = "ghostmode-reminder",
    SAFETY_CALL_REMINDER = "safety-call-booked-reminder",
}
