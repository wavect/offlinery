import { mockEnvConfig } from "@/__mocks__/mock-env.config";
import { AuthService } from "@/auth/auth.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntityBuilder } from "../../_src/builders/user-entity.builder";
import { createRandomAppUser } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("AuthService", () => {
    let authService: AuthService;
    let jwtService: JwtService;
    let userRepository: UserRepository;
    let userService: UserService;

    beforeEach(async () => {
        const { module } = await getIntegrationTestModule();
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userRepository = module.get<UserRepository>(getRepositoryToken(User));
        userService = module.get<UserService>(UserService);
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
        const user = new UserEntityBuilder()
            .setField("email", "testuser@test.at")
            .build();
        await userService.hashNewPassword(user, pwd);
        const persistedUser = await createRandomAppUser(userRepository, user);

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
