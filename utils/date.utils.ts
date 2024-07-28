
export const getAge = (birthday: Date): number => {
    let timeDiff = Math.abs(Date.now() - birthday.getTime());
    return Math.floor((timeDiff / (1000 * 3600 * 24))/365.25);
}