import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { EGender } from "@/types/user.types";
import { createRandomAppUser } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("NotificationService", () => {
    let userRepository: UserRepository;
    let userService: UserService;
    let testingMainUser: User;

    beforeAll(async () => {
        const { module, mainUser } = await getIntegrationTestModule();
        testingMainUser = mainUser;
        userRepository = module.get<UserRepository>(UserRepository);
        userService = module.get<UserService>(UserService);

        expect(testingMainUser).toBeDefined();
    });

    describe("notification service", () => {
        it("should delete a freshly added user by the delete token", async () => {
            const deleteToken = "DELETE_TOKEN";
            const user = await createRandomAppUser(userRepository, {
                email: "email1@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
                deletionToken: deleteToken,
                deletionTokenExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ),
            });

            // user lookup by email works
            const userLookup = await userRepository.findBy({
                email: user.email,
            });
            expect(userLookup).toBeDefined();

            // user lookup by delete_token works
            const userLookupbyToken = await userRepository.findBy({
                deletionToken: deleteToken,
            });
            expect(userLookupbyToken).toBeDefined();

            // act: delete the user
            await userService.deleteUserByDeletionToken(deleteToken);

            // assert: user does no longer exist
            const userLookupFailing = await userRepository.findOneBy({
                email: user.email,
            });
            expect(userLookupFailing).toEqual(null);
        });
    });
});
