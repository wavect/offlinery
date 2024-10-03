import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { EGender } from "@/types/user.types";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("UserService", () => {
    let userRepository: UserRepository;
    let userService: UserService;
    let encounterService: EncounterService;
    let testingMainUser: User;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;

    beforeAll(async () => {
        const { module, mainUser, factories } =
            await getIntegrationTestModule();
        testingMainUser = mainUser;
        userRepository = module.get<UserRepository>(UserRepository);
        userService = module.get<UserService>(UserService);
        encounterService = module.get<EncounterService>(EncounterService);
        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;

        expect(testingMainUser).toBeDefined();
    });

    describe("notification service", () => {
        it("should delete a freshly added user by the delete token", async () => {
            const deleteToken = "DELETE_TOKEN";
            const user = await userFactory.persistTestUser({
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
        }, 10000);

        it("should delete a freshly added user by the delete token that sended messages, had encounters", async () => {
            const deleteToken = "DELETE_TOKEN-FOO";
            const user = await userFactory.persistTestUser({
                email: "email1@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
                deletionToken: deleteToken,
                deletionTokenExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ),
            });

            const encounterUser = await userFactory.persistTestUser({
                email: "encounter@email.com",
            });

            // user lookup by email works
            const userLookup = await userRepository.findOneBy({
                email: user.email,
            });
            expect(userLookup).toBeDefined();

            // user lookup by delete_token works
            const userLookupbyToken = await userRepository.findOneBy({
                deletionToken: deleteToken,
            });
            expect(userLookupbyToken).toBeDefined();

            await encounterFactory.persistTestEncounter(user, encounterUser);

            // act: delete the user
            await userService.deleteUserByDeletionToken(deleteToken);

            // assert: user does no longer exist
            const userLookupFailing = await userRepository.findOneBy({
                email: user.email,
            });
            expect(userLookupFailing).toEqual(null);
        }, 10000);

        it("should delete a freshly added user by the delete token that sended messages", async () => {
            const deleteToken = "DELETE_TOKEN-BAR";
            const user = await userFactory.persistTestUser({
                email: "email2@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: EGender.MAN,
                deletionToken: deleteToken,
                deletionTokenExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ),
            });

            const encounterUser = await userFactory.persistTestUser({
                email: "encounter-foo@email.com",
            });

            // user lookup by email works
            const userLookup = await userRepository.findOneBy({
                email: user.email,
            });
            expect(userLookup).toBeDefined();

            // user lookup by delete_token works
            const userLookupbyToken = await userRepository.findOneBy({
                deletionToken: deleteToken,
            });
            expect(userLookupbyToken).toBeDefined();

            const encounter = await encounterFactory.persistTestEncounter(
                user,
                encounterUser,
            );

            await encounterService.pushMessage(userLookup.id, {
                content: "Hi there, here's my number: +43 123 123 23",
                encounterId: encounter.id,
            });

            // act: delete the user
            await userService.deleteUserByDeletionToken(deleteToken);

            // assert: user does no longer exist
            const userLookupFailing = await userRepository.findOneBy({
                email: user.email,
            });
            expect(userLookupFailing).toEqual(null);
        }, 10000);
    });
});
