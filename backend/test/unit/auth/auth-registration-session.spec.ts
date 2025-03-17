import { UserSpecificRegistrationGuard } from "@/auth/auth-registration-session";
import { USER_ID_PARAM, USER_OBJ_ID } from "@/auth/auth.guard";
import {
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@/utils/env.utils", () => ({
    TYPED_ENV: {
        JWT_SECRET_REGISTRATION: "test-secret",
    },
}));

describe("UserSpecificRegistrationGuard", () => {
    let guard: UserSpecificRegistrationGuard;
    let reflector: jest.Mocked<Reflector>;
    let jwtService: jest.Mocked<JwtService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSpecificRegistrationGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<UserSpecificRegistrationGuard>(
            UserSpecificRegistrationGuard,
        );
        reflector = module.get(Reflector);
        jwtService = module.get(JwtService);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
    });

    it("should allow access when the guard is not required", async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });

    it("should throw UnauthorizedException when token is invalid", async () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const context = createMockExecutionContext({
            headers: { authorization: "Bearer invalid-token" },
        });
        jwtService.verifyAsync.mockRejectedValue(new Error("Invalid token"));

        await expect(guard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it("should throw ForbiddenException when user ID in params does not match authenticated user", async () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const context = createMockExecutionContext({
            headers: { authorization: "Bearer valid-token" },
            params: { [USER_ID_PARAM]: "user-2" },
            user: { id: "user-1" },
        });
        jwtService.verifyAsync.mockResolvedValue({ id: "user-1" });

        await expect(guard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
        );
    });

    it("should allow access when all checks pass", async () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const context = createMockExecutionContext({
            headers: { authorization: "Bearer valid-token" },
            params: { [USER_ID_PARAM]: "user-1" },
            user: { id: "user-1" },
        });
        jwtService.verifyAsync.mockResolvedValue({ id: "user-1" });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
    });
});

function createMockExecutionContext(
    overrides: Partial<{ headers: any; params: any; user: any }> = {},
): ExecutionContext {
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
                [USER_OBJ_ID]: overrides.user ?? { id: "user-1" },
            }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
    };

    return mockContext as unknown as ExecutionContext;
}
