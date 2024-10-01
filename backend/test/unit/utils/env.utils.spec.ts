// NOTE: Do not import env.utilts.ts globally here as it would immediately validate the envs and make the test probably fail

jest.unmock("@/utils/env.utils"); // remove global mock to run a real .env test

// Mock dotenv
jest.mock("dotenv", () => ({
    config: jest.fn(),
}));

describe("Environment Validation", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("should validate correct environment variables", () => {
        process.env = {
            DB_HOST: "localhost",
            DB_PORT: "5432",
            DB_USER: "user",
            DB_PASSWORD: "password",
            DB_DATABASE: "database",
            JWT_SECRET: "secret",
            EMAIL_HOST: "smtp.example.com",
            EMAIL_USERNAME: "user@example.com",
            EMAIL_PASSWORD: "emailpassword",
            BE_PORT: "3000",
            JWT_SECRET_REGISTRATION: "12345",
        };

        const { validateEnv } = require("../../../src/utils/env.utils");
        const result = validateEnv();
        expect(result).toEqual({
            DB_HOST: "localhost",
            DB_PORT: 5432,
            DB_USER: "user",
            DB_PASSWORD: "password",
            DB_DATABASE: "database",
            JWT_SECRET: "secret",
            EMAIL_HOST: "smtp.example.com",
            EMAIL_USERNAME: "user@example.com",
            EMAIL_PASSWORD: "emailpassword",
            BE_PORT: 3000,
        });
    });

    it("should throw an error for missing environment variables", () => {
        process.env = {};

        expect(() => require("../../../src/utils/env.utils")).toThrow(
            "Invalid environment variables",
        );
    });

    it("should return the same object on subsequent calls", () => {
        process.env = {
            DB_HOST: "localhost",
            DB_PORT: "5432",
            DB_USER: "user",
            DB_PASSWORD: "password",
            DB_DATABASE: "database",
            JWT_SECRET: "secret",
            EMAIL_HOST: "smtp.example.com",
            EMAIL_USERNAME: "user@example.com",
            EMAIL_PASSWORD: "emailpassword",
            BE_PORT: "3000",
            JWT_SECRET_REGISTRATION: "12345",
        };

        const { validateEnv } = require("../../../src/utils/env.utils");
        const result1 = validateEnv();
        const result2 = validateEnv();

        expect(result1).toBe(result2);
    });

    it("should export TYPED_ENV with correct values", () => {
        process.env = {
            DB_HOST: "localhost",
            DB_PORT: "5432",
            DB_USER: "user",
            DB_PASSWORD: "password",
            DB_DATABASE: "database",
            JWT_SECRET: "secret",
            EMAIL_HOST: "smtp.example.com",
            EMAIL_USERNAME: "user@example.com",
            EMAIL_PASSWORD: "emailpassword",
            BE_PORT: "3000",
            JWT_SECRET_REGISTRATION: "12345",
        };

        const { TYPED_ENV } = require("../../../src/utils/env.utils");
        expect(TYPED_ENV).toEqual({
            DB_HOST: "localhost",
            DB_PORT: 5432,
            DB_USER: "user",
            DB_PASSWORD: "password",
            DB_DATABASE: "database",
            JWT_SECRET: "secret",
            EMAIL_HOST: "smtp.example.com",
            EMAIL_USERNAME: "user@example.com",
            EMAIL_PASSWORD: "emailpassword",
            BE_PORT: 3000,
            JWT_SECRET_REGISTRATION: "12345",
        });
    });
});
