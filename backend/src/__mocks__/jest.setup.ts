import { mockEnvConfig } from "@/__mocks__/mock-env.config";

jest.mock("@/utils/env.utils", () => ({
    validateEnv: jest.fn().mockReturnValue(mockEnvConfig),
    TYPED_ENV: mockEnvConfig,
}));
