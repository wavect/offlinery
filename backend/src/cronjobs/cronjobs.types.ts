import { Logger } from "@nestjs/common";

const logger = new Logger("cronjobs.types");

export type IntervalHour = {
    translationKey: string;
    hours: number;
};

/** @dev Needs to be chronological for sql statements */
export const DEFAULT_INTERVAL_HOURS: IntervalHour[] = [
    { hours: 24, translationKey: "main.cron.intervalHours.h24" },
    { hours: 72, translationKey: "main.cron.intervalHours.h72" },
    { hours: 336, translationKey: "main.cron.intervalHours.h336" }, // 14 days * 24 hours
];

export const getIntervalDateTime = (interval: IntervalHour) => {
    const now = new Date();
    return new Date(now.getTime() - interval.hours * 60 * 60 * 1000);
};

export const getPreviousInterval = (
    interval: IntervalHour,
): IntervalHour | null => {
    switch (interval.hours) {
        case 24:
            return null;
        case 72:
            return DEFAULT_INTERVAL_HOURS[0];
        case 336:
            return DEFAULT_INTERVAL_HOURS[1];
    }
    logger.error(
        `Unknown interval hour: ${interval.hours} or badly maintained getPreviousInterval!`,
    );
    return null;
};

/** @dev String value used for translation keys */
export enum ECronJobType {
    GHOST_MODE_REMINDER = "ghostmode-reminder",
    SAFETY_CALL_REMINDER = "safety-call-booked-reminder",
}
