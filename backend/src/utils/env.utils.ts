// Define the environment variable names as a const array
const ENV_VARS = [
    "DB_ROOT_PASSWORD",
    "DB_DATABASE",
    "DB_USER",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_PORT",
    "JWT_SECRET",
    "EMAIL_HOST",
    "EMAIL_USERNAME",
    "EMAIL_PASSWORD",
] as const;

// Create a type from the array
type EnvVars = (typeof ENV_VARS)[number];

// Define the IEnv interface dynamically
type IEnv = {
    [K in EnvVars]: string;
};

// Create TYPED_ENV
export const TYPED_ENV: IEnv = ENV_VARS.reduce((env, key) => {
    env[key] = process.env[key] as string;
    return env;
}, {} as IEnv);

/** @dev Mandatory environment variables must be defined. */
export const validateEnv = () => {
    for (const key of ENV_VARS) {
        if (TYPED_ENV[key] === undefined) {
            throw new Error(`Environment variable '${key}' is not defined.`);
        }
    }
};
