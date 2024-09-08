import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import {
    USER_ID_PARAM,
    UserSpecificAuthGuard,
} from "../../../src/auth/auth-own-data.guard";

describe("UserSpecificAuthGuard", () => {
    let guard: UserSpecificAuthGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserSpecificAuthGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<UserSpecificAuthGuard>(UserSpecificAuthGuard);
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
                    getRequest: jest.fn().mockReturnValue({}),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any;
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
