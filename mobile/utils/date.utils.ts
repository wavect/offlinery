import { TR, i18n } from "@/localization/translate.service";

export const getAge = (birthday: Date | string): number => {
    let birthdayDate: Date;
    if (typeof birthday === "string") {
        birthdayDate = new Date(birthday);
    } else {
        birthdayDate = birthday;
    }
    let timeDiff = Math.abs(Date.now() - birthdayDate.getTime());
    return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
};

export const get3MonthsBefore = () => {
    const threeMonthsBefore = new Date();
    threeMonthsBefore.setDate(threeMonthsBefore.getDate() - 90);
    return threeMonthsBefore;
};

export const formatDate = (dateString?: string) => {
    if (!dateString) {
        return "N/V";
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "N/V";
    }
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

export const getTimePassedWithText = (
    timestampStr: string | undefined,
): string => {
    if (!timestampStr) return "N/V";

    const timestamp = new Date(timestampStr);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);

    if (minutes < 5) {
        return i18n.t(TR.justNow);
    } else if (minutes < 60) {
        return `${minutes} ${i18n.t(TR.minutesAgo)}`;
    } else if (hours < 24) {
        return `${hours} ${i18n.t(TR.hoursAgo)}`;
    } else if (days < 7) {
        return `${days} ${i18n.t(TR.daysAgo)}`;
    } else if (weeks < 4) {
        return `${weeks} ${i18n.t(TR.weeksAgo)}`;
    } else if (months < 12) {
        return `${months} ${i18n.t(TR.monthsAgo)}`;
    } else {
        return `${years} ${i18n.t(TR.yearsAgo)}`;
    }
};
