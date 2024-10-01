export const RESEND_EMAIL_CODE_TIMEOUT_IN_MS = 120 * 1000; // 2 min
export const EMAIL_CODE_EXPIRATION_IN_MS = 15 * 60 * 1000; // 15 min

export const generate6DigitEmailCode = (): string => {
    let verificationNumber: string = "";
    for (let index = 0; index <= 5; index++) {
        const randomNumber = Math.floor(Math.random() * 9).toString();

        verificationNumber = verificationNumber.concat(randomNumber);
    }
    return verificationNumber;
};
