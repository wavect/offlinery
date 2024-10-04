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

export const getTimeLastMet = (
    i18n: any,
    TR: any,
    timestampStr: string | undefined,
): string => {
    if (!timestampStr) return "";

    const timestamp = new Date(timestampStr);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = diff / 60000;
    const hours = minutes / 60;
    const days = hours / 24;
    const weeks = days / 7;
    const months = days / 30.44;
    const years = days / 365.25;

    if (minutes < 60) {
        return i18n.t(TR.justNow);
    } else if (hours < 24) {
        return `${Math.floor(hours)} ${i18n.t(TR.hoursAgo)}`;
    } else if (days < 7) {
        return `${Math.floor(days)} ${i18n.t(TR.daysAgo)}`;
    } else if (weeks < 4) {
        return `${Math.floor(weeks)} ${i18n.t(TR.weeksAgo)}`;
    } else if (months < 12) {
        return `${Math.floor(months)} ${i18n.t(TR.monthsAgo)}`;
    } else {
        return `${Math.floor(years)} ${i18n.t(TR.yearsAgo)}`;
    }
};
