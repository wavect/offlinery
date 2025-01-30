import { AuthGuard, USER_ID_PARAM } from "@/auth/auth.guard";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { UserService } from "@/entities/user/user.service";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthGuard:OnlyOwnData", () => {
    let guard: AuthGuard;
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
                {
                    provide: UserService,
                    useValue: {
                        isValidRestrictedViewToken: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it("should be defined", () => {
        expect(guard).toBeDefined();
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

        it("should return true if @OnlyOwnUserData is not set", () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
            expect(guard.canActivate(mockExecutionContext)).toBe(true);
        });

        it("should throw ForbiddenException if user is not authenticated", () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({ user: null });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                ForbiddenException,
            );
        });

        it("should return true if user ID matches param ID", () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({
                user: { id: "123" },
                params: { [USER_ID_PARAM]: "123" },
            });

            expect(guard.canActivate(mockExecutionContext)).toBe(true);
        });

        it("should throw ForbiddenException if user ID does not match param ID", () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({
                user: { id: "123" },
                params: { [USER_ID_PARAM]: "456" },
            });

            expect(() => guard.canActivate(mockExecutionContext)).toThrow(
                ForbiddenException,
            );
        });

        it("should return true if user ID param is not present", () => {
            jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
            (
                mockExecutionContext.switchToHttp().getRequest as jest.Mock
            ).mockReturnValue({
                user: { id: "123" },
                params: {},
            });

            expect(guard.canActivate(mockExecutionContext)).toBe(true);
        });
    });
});
