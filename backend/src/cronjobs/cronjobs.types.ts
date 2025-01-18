export type IntervalHour = {
    translationKey: string;
    hours: number;
};

/** @dev Needs to be chronological for sql statements */
export const DEFAULT_INTERVAL_HOURS: IntervalHour[] = [
    { hours: 336, translationKey: "main.cron.intervalHours.h336" }, // 14 days * 24 hours
    { hours: 72, translationKey: "main.cron.intervalHours.h72" },
    { hours: 24, translationKey: "main.cron.intervalHours.h24" },
];

/** @dev String value used for translation keys */
export enum ECronJobType {
    GHOST_MODE_REMINDER = "ghostmode-reminder",
    SAFETY_CALL_REMINDER = "safety-call-booked-reminder",
}
