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
    EMAIL_HOST: z.string(),
    EMAIL_USERNAME: z.string(),
    EMAIL_PASSWORD: z.string(),
    BE_PORT: z.string().transform(Number),
});

// Parse and validate the environment variables
const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
    console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(envParse.error.format(), null, 4),
    );
    process.exit(1);
}

// Export the validated environment variables
export const TYPED_ENV = envParse.data;

// Type for the validated environment
export type TypedEnv = z.infer<typeof envSchema>;

// Function to validate the environment
export function validateEnv(): void {
    console.log("✅ Environment variables validated successfully");
}
