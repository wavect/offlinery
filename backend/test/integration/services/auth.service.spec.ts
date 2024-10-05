import { mockEnvConfig } from "@/__mocks__/mock-env.config";
import { AuthService } from "@/auth/auth.service";
import { UserService } from "@/entities/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UserBuilder } from "../../_src/builders/user.builder";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("AuthService", () => {
    let authService: AuthService;
    let jwtService: JwtService;
    let userService: UserService;
    let userFactory: UserFactory;

    beforeEach(async () => {
        const { module, factories } = await getIntegrationTestModule();
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userService = module.get<UserService>(UserService);
        userFactory = factories.get("user") as UserFactory;
    });

    it("should create a registration session", async () => {
        // arrange
        const userIdUnderTest = "123-456-789";
        // act
        const session =
            await authService.createRegistrationSession(userIdUnderTest);
        // assert
        expect(session).toBeDefined();
        const decoded = await jwtService.verifyAsync(session, {
            secret: mockEnvConfig.JWT_SECRET_REGISTRATION,
        });
        expect(decoded.pendingUserId).toEqual(userIdUnderTest);
    });

    it("should sign in with Email/Password and then sign in with the JWT that was returned", async () => {
        const pwd = "super-safe-pwd";
        const user = new UserBuilder().withEmail("testuser@test.at").build();
        await userService.hashNewPassword(user, pwd);
        const persistedUser = await userFactory.persistTestUser(user);

        const signInResponse = await authService.signIn(
            persistedUser.email,
            pwd,
        );

        const signInJwtResponse = await authService.signInWithJWT(
            signInResponse.accessToken,
        );

        expect(signInResponse.accessToken).toEqual(
            signInJwtResponse.accessToken,
        );
    });
});
