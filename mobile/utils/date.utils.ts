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
