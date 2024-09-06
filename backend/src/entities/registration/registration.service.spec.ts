import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { EEmailVerificationStatus } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RegistrationService } from "./registration.service";

describe("RegistrationService", () => {
    let service: RegistrationService;
    let pendingUserRepo: Repository<PendingUser>;
    let userRepo: Repository<User>;
    let mailerService: MailerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegistrationService,
                {
                    provide: getRepositoryToken(PendingUser),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<RegistrationService>(RegistrationService);
        pendingUserRepo = module.get<Repository<PendingUser>>(
            getRepositoryToken(PendingUser),
        );
        userRepo = module.get<Repository<User>>(getRepositoryToken(User));
        mailerService = module.get<MailerService>(MailerService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("registerPendingUser", () => {
        it("should throw an error if email already exists", async () => {
            const email = "test@example.com";
            jest.spyOn(userRepo, "findOneBy").mockResolvedValue({
                id: 1,
                email,
            } as any as User);

            await expect(service.registerPendingUser(email)).rejects.toThrow(
                "Email already exists.",
            );
        });

        it("should create a new pending user if one does not exist", async () => {
            const email = "new@example.com";
            jest.spyOn(userRepo, "findOneBy").mockResolvedValue(null);
            jest.spyOn(pendingUserRepo, "findOneBy").mockResolvedValue(null);
            jest.spyOn(pendingUserRepo, "save").mockResolvedValue(
                {} as PendingUser,
            );
            jest.spyOn(mailerService, "sendMail").mockResolvedValue({} as any);

            const result = await service.registerPendingUser(email);

            expect(result).toHaveProperty("email", email);
            expect(result).toHaveProperty("timeout");
            expect(result).toHaveProperty("verificationCodeIssuedAt");
        });

        it("should update existing pending user if one exists", async () => {
            const email = "existing@example.com";
            const existingPendingUser = new PendingUser();
            existingPendingUser.email = email;
            existingPendingUser.verificationStatus =
                EEmailVerificationStatus.PENDING;
            existingPendingUser.verificationCodeIssuedAt = new Date(
                Date.now() - 1000000,
            );

            jest.spyOn(userRepo, "findOneBy").mockResolvedValue(null);
            jest.spyOn(pendingUserRepo, "findOneBy").mockResolvedValue(
                existingPendingUser,
            );
            jest.spyOn(pendingUserRepo, "save").mockResolvedValue(
                existingPendingUser,
            );
            jest.spyOn(mailerService, "sendMail").mockResolvedValue({} as any);

            const result = await service.registerPendingUser(email);

            expect(result).toHaveProperty("email", email);
            expect(result).toHaveProperty("timeout");
            expect(result).toHaveProperty("verificationCodeIssuedAt");
        });

        it("should not send a new verification code if one was recently issued", async () => {
            const email = "recent@example.com";
            const recentPendingUser = new PendingUser();
            recentPendingUser.email = email;
            recentPendingUser.verificationStatus =
                EEmailVerificationStatus.PENDING;
            recentPendingUser.verificationCodeIssuedAt = new Date();

            jest.spyOn(userRepo, "findOneBy").mockResolvedValue(null);
            jest.spyOn(pendingUserRepo, "findOneBy").mockResolvedValue(
                recentPendingUser,
            );

            const result = await service.registerPendingUser(email);

            expect(result).toHaveProperty("email", email);
            expect(result).toHaveProperty("timeout");
            expect(result).toHaveProperty("verificationCodeIssuedAt");
            expect(mailerService.sendMail).not.toHaveBeenCalled();
        });
    });

    describe("verifyEmail", () => {
        it("should throw an error if pending user is not found", async () => {
            jest.spyOn(pendingUserRepo, "findOneByOrFail").mockRejectedValue(
                new Error("User not found"),
            );

            await expect(
                service.verifyEmail("nonexistent@example.com", "123456"),
            ).rejects.toThrow();
        });

        it("should throw an error if verification code has expired", async () => {
            const expiredUser = new PendingUser();
            expiredUser.verificationCodeIssuedAt = new Date(
                Date.now() - 1000000000,
            );

            jest.spyOn(pendingUserRepo, "findOneByOrFail").mockResolvedValue(
                expiredUser,
            );

            await expect(
                service.verifyEmail("expired@example.com", "123456"),
            ).rejects.toThrow("Verification code has expired.");
        });

        it("should update verification status to VERIFIED if code is valid", async () => {
            const validUser = new PendingUser();
            validUser.verificationCodeIssuedAt = new Date();

            jest.spyOn(pendingUserRepo, "findOneByOrFail").mockResolvedValue(
                validUser,
            );
            jest.spyOn(pendingUserRepo, "save").mockResolvedValue(validUser);

            await service.verifyEmail("valid@example.com", "123456");

            expect(validUser.verificationStatus).toBe(
                EEmailVerificationStatus.VERIFIED,
            );
            expect(pendingUserRepo.save).toHaveBeenCalledWith(validUser);
        });
    });
});
