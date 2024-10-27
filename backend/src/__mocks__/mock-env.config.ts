import { TypedEnv } from "@/utils/env.utils";
import { mockDeep } from "jest-mock-extended";

export const mockEnvConfig: TypedEnv = {
    DB_HOST: "localhost",
    DB_PORT: 5432,
    DB_USER: "testuser",
    DB_PASSWORD: "testpassword",
    DB_DATABASE: "testdb",
    JWT_SECRET: "test-secret",
    JWT_SECRET_REGISTRATION: "registration-test-secret",
    EMAIL_HOST: "test-smtp.example.com",
    EMAIL_USERNAME: "test@example.com",
    EMAIL_PASSWORD: "testpassword",
    BE_PORT: 3000,
    MAILCHIMP_SERVER_PREFIX: "abc",
    MAILCHIMP_API_KEY: "xyz",
    MAILCHIMP_AUDIENCE_ID: "123",
};

export const validateEnv = jest.fn().mockReturnValue(mockEnvConfig);
export const TYPED_ENV = mockEnvConfig;

export default mockDeep<typeof import("@/utils/env.utils")>();
