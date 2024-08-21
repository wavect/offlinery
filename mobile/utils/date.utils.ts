
export const getAge = (birthday: Date|string): number => {
    let birthdayDate: Date;
    if (typeof birthday === 'string') {
        birthdayDate = new Date(birthday);
    } else {
        birthdayDate = birthday;
    }
    let timeDiff = Math.abs(Date.now() - birthdayDate.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
}