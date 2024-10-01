import { AuthService } from "@/auth/auth.service";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthService", () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

    const mockUser = {
        id: "1",
        email: "test@example.com",
        convertToPrivateDTO: jest
            .fn()
            .mockReturnValue({ id: "1", email: "test@example.com" }),
    } as unknown as User;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        findUserByRefreshToken: jest.fn(),
                        storeRefreshToken: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
    });

    describe("refreshAccessToken", () => {
        it("should return new access token, refresh token, and user data when given a valid refresh token", async () => {
            const refreshToken = "valid-refresh-token";
            const newAccessToken = "new-access-token";
            const newRefreshToken = "new-refresh-token";

            jest.spyOn(userService, "findUserByRefreshToken").mockResolvedValue(
                mockUser,
            );
            jest.spyOn(jwtService, "signAsync").mockResolvedValue(
                newAccessToken,
            );
            jest.spyOn(
                authService as any,
                "generateRefreshToken",
            ).mockResolvedValue(newRefreshToken);

            const result = await authService.refreshAccessToken(refreshToken);

            expect(result).toEqual({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: mockUser.convertToPrivateDTO(),
            });
            expect(userService.findUserByRefreshToken).toHaveBeenCalledWith(
                refreshToken,
            );
            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
            });
            expect(authService["generateRefreshToken"]).toHaveBeenCalledWith(
                mockUser,
            );
        });

        it("should handle errors and log them", async () => {
            const refreshToken = "valid-refresh-token";
            const error = new Error("Test error");

            jest.spyOn(userService, "findUserByRefreshToken").mockRejectedValue(
                error,
            );
            jest.spyOn(authService["logger"], "debug");

            await authService.refreshAccessToken(refreshToken);

            expect(authService["logger"].debug).toHaveBeenCalledWith(
                "User refreshment failed (jwt refresh) ",
                error,
            );
        });
    });
});
