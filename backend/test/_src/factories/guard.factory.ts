import { USER_OBJ_ID } from "@/auth/auth.guard";
import { ExecutionContext } from "@nestjs/common";

const createAuthRegistrationGuardExecutionContext = (
    overrides: Partial<{ headers: any; params: any }> = {},
): ExecutionContext => {
    const mockContext = {
        switchToHttp: () => ({
            getRequest: () => ({
                headers: {
                    authorization: "Bearer mock-token",
                    ...overrides.headers,
                },
                params: {
                    ...overrides.params,
                },
                [USER_OBJ_ID]: { id: "user-1" },
            }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
    };

    return mockContext as unknown as ExecutionContext;
};

export const mockAuthGuards = {
    registrationSession: createAuthRegistrationGuardExecutionContext,
};
