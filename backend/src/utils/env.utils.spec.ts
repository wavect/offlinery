/* eslint @typescript-eslint/no-var-requires: "off" */

describe("env.utils", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe("TYPED_ENV", () => {
        it("should contain all expected environment variables", () => {
            const expectedKeys = [
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
            ];

            expectedKeys.forEach((key) => {
                process.env[key] = "test-value";
            });

            // Re-import to get updated TYPED_ENV
            jest.resetModules();
            const { TYPED_ENV } = require("./env.utils");

            expectedKeys.forEach((key) => {
                expect(TYPED_ENV).toHaveProperty(key);
            });
        });
    });

    describe("validateEnv", () => {
        it("should not throw an error when all environment variables are defined", () => {
            const requiredEnvVars = {
                DB_ROOT_PASSWORD: "root",
                DB_DATABASE: "mydb",
                DB_USER: "user",
                DB_PASSWORD: "pass",
                DB_HOST: "localhost",
                DB_PORT: "5432",
                JWT_SECRET: "secret",
                EMAIL_HOST: "smtp.example.com",
                EMAIL_USERNAME: "user@example.com",
                EMAIL_PASSWORD: "emailpass",
            };

            Object.assign(process.env, requiredEnvVars);

            // Re-import to get updated TYPED_ENV
            jest.resetModules();
            const { validateEnv } = require("./env.utils");

            expect(() => validateEnv()).not.toThrow();
        });

        it("should throw an error when an environment variable is undefined", () => {
            const requiredEnvVars = {
                DB_ROOT_PASSWORD: "root",
                // DB_DATABASE is intentionally omitted
                DB_USER: "user",
                DB_PASSWORD: "pass",
                DB_HOST: "localhost",
                DB_PORT: "5432",
                JWT_SECRET: "secret",
                EMAIL_HOST: "smtp.example.com",
                EMAIL_USERNAME: "user@example.com",
                EMAIL_PASSWORD: "emailpass",
            };

            // Clear all env vars and set only the ones in requiredEnvVars
            process.env = {};
            Object.assign(process.env, requiredEnvVars);

            // Re-import to get updated TYPED_ENV
            jest.resetModules();
            const { validateEnv } = require("./env.utils");

            expect(() => validateEnv()).toThrow(
                "Environment variable 'DB_DATABASE' is not defined.",
            );
        });
    });
});
