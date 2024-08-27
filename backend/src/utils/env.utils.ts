
export const TYPED_ENV: IEnv = process.env as any as IEnv

interface IEnv {
    DB_ROOT_PASSWORD: string
    DB_DATABASE: string
    DB_USER: string
    DB_PASSWORD: string
    DB_HOST: string
    DB_PORT: string
    JWT_SECRET: string
    EMAIL_HOST: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
}

/** @dev Mandatory environment variables must be defined. */
export const validateEnv = () => {
    for (const [key, value] of Object.entries(TYPED_ENV)) {
        if (value === undefined) {
            throw new Error(`Environment variable '${key}' is not defined.`);
        }
    }
}

try {
    validateEnv();
} catch (error) {
    console.error(error);
    process.exit(1);
}