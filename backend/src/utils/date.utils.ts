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
