import { AuthService } from "@/auth/auth.service";
import { UserService } from "@/entities/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserEntityBuilder } from "../../_src/builders/user-entity.builder";

describe("AuthService", () => {
    let authService: AuthService;
    let userService: UserService;
    let jwtService: JwtService;

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

            const mockUser = new UserEntityBuilder().build();
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

            expect(result).toEqual(
                expect.objectContaining({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    user: mockUser.convertToPrivateDTO(),
                }),
            );
        });
    });
});
