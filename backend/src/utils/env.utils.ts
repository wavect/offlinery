import * as dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

// Define the schema for our environment variables
const envSchema = z.object({
    DB_HOST: z.string(),
    DB_PORT: z.string().transform(Number),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
    JWT_SECRET: z.string(),
    JWT_SECRET_REGISTRATION: z.string(),
    EMAIL_HOST: z.string(),
    EMAIL_USERNAME: z.string(),
    EMAIL_PASSWORD: z.string(),
    BE_PORT: z.string().transform(Number),
});

// Type for the validated environment
export type TypedEnv = z.infer<typeof envSchema>;

// Function to validate the environment
let lazyEnv: TypedEnv; // internal variable
export function validateEnv(): TypedEnv {
    if (lazyEnv) {
        return lazyEnv; // just validate once
    }
    const envParse = envSchema.safeParse(process.env);

    if (!envParse.success) {
        console.error(
            "❌ Invalid environment variables:",
            JSON.stringify(envParse.error.format(), null, 4),
        );
        throw new Error("Invalid environment variables");
    }

    console.log("✅ Environment variables validated successfully");
    lazyEnv = envParse.data;
    return lazyEnv;
}

// Export the validated environment variables
export const TYPED_ENV = validateEnv();
