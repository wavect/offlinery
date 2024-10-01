import { AuthGuard } from "@/auth/auth.guard";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthGuard", () => {
    let authGuard: AuthGuard;
    let jwtService: JwtService;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
                {
                    provide: ApiUserService,
                    useValue: {
                        findApiUserByApiKey: jest.fn(),
                    },
                },
            ],
        }).compile();

        authGuard = module.get<AuthGuard>(AuthGuard);
        jwtService = module.get<JwtService>(JwtService);
        reflector = module.get<Reflector>(Reflector);
    });

    it("should be defined", () => {
        expect(authGuard).toBeDefined();
    });

    describe("canActivate", () => {
        let mockExecutionContext: ExecutionContext;

        beforeEach(() => {
            mockExecutionContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        headers: {},
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;
        });

        it("should allow access to public routes", async () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

            const result = await authGuard.canActivate(mockExecutionContext);

            expect(result).toBe(true);
        });

        it("should throw UnauthorizedException when no token is provided", async () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

            await expect(
                authGuard.canActivate(mockExecutionContext),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should throw UnauthorizedException when an invalid token is provided", async () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({
                headers: { authorization: "Bearer invalid_token" },
            });
            jest.spyOn(jwtService, "verifyAsync").mockRejectedValue(
                new Error("Invalid token"),
            );

            await expect(
                authGuard.canActivate(mockExecutionContext),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("should allow access when a valid token is provided", async () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({
                headers: { authorization: "Bearer valid_token" },
            });
            jest.spyOn(jwtService, "verifyAsync").mockResolvedValue({
                userId: "123",
            });

            const result = await authGuard.canActivate(mockExecutionContext);

            expect(result).toBe(true);
            expect(
                mockExecutionContext.switchToHttp().getRequest().user,
            ).toEqual({ userId: "123" });
        });
    });
});
