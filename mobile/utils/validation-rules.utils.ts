export const isValidPassword = (clearPassword: string): boolean => {
    return !!clearPassword.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\W]{6,40}$/,
    );
};

export const isValidEmail = (email: string): boolean => {
    return !!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
};
