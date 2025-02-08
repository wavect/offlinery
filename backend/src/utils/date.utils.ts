import { ELanguage } from "@/types/user.types";

/** @dev Get current dateTime - 24h right now to define users as nearby right now */
export const getNearbyMaxLocationAge = () =>
    new Date(Date.now() - 24 * 60 * 60 * 1000);

export const getAge = (birthday: Date | string): number => {
    const birthdayDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthdayDate.getFullYear();
    const monthDiff = today.getMonth() - birthdayDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthdayDate.getDate())
    ) {
        age--;
    }

    return Math.max(0, age);
};

const DEFAULT_TIMEZONE_CET = "Europe/Berlin";
const LOCALES_LANG_MAPPING: {
    [K in ELanguage]: string;
} = {
    [ELanguage.en]: "en-US",
    [ELanguage.de]: "de-DE",
};
/** dev Translates DateTime object into localized string for Date and Time each.
 * @ref https://wavect.atlassian.net/jira/software/c/projects/OF/boards/29?selectedIssue=OF-635 */
export const formatMultiLanguageDateTimeStringsCET = (
    dateTime: Date,
    lang: ELanguage,
) => {
    const locales =
        LOCALES_LANG_MAPPING[lang] ?? LOCALES_LANG_MAPPING[ELanguage.en];

    const cetTime = new Date(dateTime.getTime());
    cetTime.toLocaleString(locales, { timeZone: DEFAULT_TIMEZONE_CET });

    // English formats
    const dateString = cetTime.toLocaleDateString(locales, {
        timeZone: DEFAULT_TIMEZONE_CET,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const timeString = cetTime.toLocaleTimeString(locales, {
        timeZone: DEFAULT_TIMEZONE_CET,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return {
        date: dateString,
        time: timeString,
    };
};
