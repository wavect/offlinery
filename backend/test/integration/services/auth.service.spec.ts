import { mockEnvConfig } from "@/__mocks__/mock-env.config";
import { AuthService } from "@/auth/auth.service";
import { UserService } from "@/entities/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UserEntityBuilder } from "../../_src/builders/user-entity.builder";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("AuthService", () => {
    let authService: AuthService;
    let jwtService: JwtService;
    // let userRepository: UserRepository;
    let userService: UserService;

    beforeEach(async () => {
        const { module } = await getIntegrationTestModule();
        authService = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        // userRepository = module.get<UserRepository>(getRepositoryToken(User));
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

    it("should sign in with a valid JWT", function () {
        const user = new UserEntityBuilder()
            .setField("email", "testuser@test.at")
            .build();

        userService.hashNewPassword(user, "super-safe-pwd");

        // const persistedUser = createRandomAppUser(userRepository, user);
        //
        // const userJwt = authService.signIn("");
    });
});
