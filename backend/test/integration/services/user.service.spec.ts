import { EncounterService } from "@/entities/encounter/encounter.service";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { EEmailVerificationStatus, EGender } from "@/types/user.types";
import { NotFoundException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserBuilder } from "../../_src/builders/user.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { generateRandomString } from "../../_src/utils/utils";

describe("UserService", () => {
    let userRepository: UserRepository;
    let userService: UserService;
    let encounterService: EncounterService;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let pendingUserRepository: Repository<PendingUser>;

    beforeAll(async () => {
        const { module, factories } = await getIntegrationTestModule();
        userRepository = module.get<UserRepository>(UserRepository);
        userService = module.get<UserService>(UserService);
        pendingUserRepository = module.get(getRepositoryToken(PendingUser));
        encounterService = module.get<EncounterService>(EncounterService);
        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;
    });

    describe("basic user operations", () => {
        it("in order to create a user, a pending user must be in-place", async () => {
            const userPendingEmail = `testUser${generateRandomString(10)}@test.at`;

            /** @DEV needs to be inserted prior */
            const item = await pendingUserRepository.create({
                email: userPendingEmail,
                verificationCode: "1",
                verificationCodeIssuedAt: new Date(),
                verificationStatus: EEmailVerificationStatus.VERIFIED,
            });
            await pendingUserRepository.save(item);

            await userService.createUser(
                {
                    ...new UserBuilder().build(),
                    email: userPendingEmail,
                    clearPassword: "clear-pwd",
                },
                [],
            );

            const lookupUser = await userRepository.findOneBy({
                email: userPendingEmail,
            });
            expect(lookupUser).toBeDefined();
        });
        it("request user delete link", async () => {
            const userPendingEmail = `testUser${generateRandomString(10)}@test.at`;

            /** @DEV needs to be inserted prior */
            const createdUser = await pendingUserRepository.create({
                email: userPendingEmail,
                verificationCode: "1",
                verificationCodeIssuedAt: new Date(),
                verificationStatus: EEmailVerificationStatus.VERIFIED,
            });
            await pendingUserRepository.save(createdUser);

            /*** @DEV create user and create the reset cdoe */
            await userService.createUser(
                {
                    ...new UserBuilder().build(),
                    email: userPendingEmail,
                    clearPassword: "clear-pwd",
                },
                [],
            );
            let user = await userRepository.findOneBy({
                email: userPendingEmail,
            });
            user.resetPasswordCode = "TEST-RESET-CODE";
            user.resetPasswordCodeIssuedAt = new Date();

            await userRepository.save(user);
            user = await userRepository.findOneBy({
                email: userPendingEmail,
            });
            expect(user).toBeDefined();

            const result = await userService.changeUserPasswordByResetPwdLink(
                user.email,
                "TEST-RESET-CODE",
                "myNewPassword",
            );
            expect(result.passwordReset).toEqual(true);
        });
        it("should throw NotFoundException for invalid email or verification code", async () => {
            const userPendingEmail = `testUser${generateRandomString(10)}@test.at`;

            /** @DEV needs to be inserted prior */
            const createdUser = await pendingUserRepository.create({
                email: userPendingEmail,
                verificationCode: "1",
                verificationCodeIssuedAt: new Date(),
                verificationStatus: EEmailVerificationStatus.VERIFIED,
            });
            await pendingUserRepository.save(createdUser);

            /*** @DEV create user and create the reset cdoe */
            await userService.createUser(
                {
                    ...new UserBuilder().build(),
                    email: userPendingEmail,
                    clearPassword: "clear-pwd",
                },
                [],
            );
            let user = await userRepository.findOneBy({
                email: userPendingEmail,
            });
            user.resetPasswordCode = "TEST-RESET-CODE";
            user.resetPasswordCodeIssuedAt = new Date();

            await userRepository.save(user);
            user = await userRepository.findOneBy({
                email: userPendingEmail,
            });
            expect(user).toBeDefined();

            await expect(
                userService.changeUserPasswordByResetPwdLink(
                    user.email,
                    "INVALID-TEST-CODE",
                    "myNewPassword",
                ),
            ).rejects.toThrow(NotFoundException);
        });
        it("should update a push token", async () => {
            /** @DEV needs to be inserted prior */
            const createdUser = await userFactory.persistNewTestUser();
            const pushToken = "ExponentPushToken[sv2J8DEa84U3iStoXhafI9]";
            const res = await userService.updatePushToken(
                createdUser.id,
                pushToken,
            );
            expect(res).toBeDefined();
        });
    });

    describe("delete user operations", () => {
        it("should delete a freshly added user by the delete token", async () => {
            const deleteToken = "DELETE_TOKEN";
            const user = await userFactory.persistNewTestUser({
                email: "email1@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: [EGender.MAN],
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
            const userLookupByToken = await userRepository.findBy({
                deletionToken: deleteToken,
            });
            expect(userLookupByToken).toBeDefined();

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
            const user = await userFactory.persistNewTestUser({
                email: "email1@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: [EGender.MAN],
                deletionToken: deleteToken,
                deletionTokenExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ),
            });

            const encounterUser = await userFactory.persistNewTestUser({
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

            await encounterFactory.persistNewTestEncounter(user, encounterUser);

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
            const user = await userFactory.persistNewTestUser({
                email: "email2@email.com",
                approachFromTime: new Date(),
                gender: EGender.MAN,
                genderDesire: [EGender.MAN],
                deletionToken: deleteToken,
                deletionTokenExpires: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ),
            });

            const encounterUser = await userFactory.persistNewTestUser({
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

            const encounter = await encounterFactory.persistNewTestEncounter(
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
