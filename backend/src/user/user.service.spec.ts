import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import { Repository } from "typeorm";
import { BlacklistedRegion } from "../blacklisted-region/blacklisted-region.entity";
import { CreateUserDTO } from "../DTOs/create-user.dto";
import { LocationUpdateDTO } from "../DTOs/location-update.dto";
import { UpdateUserDTO } from "../DTOs/update-user.dto";
import { PendingUser } from "../registration/pending-user/pending-user.entity";
import { MatchingService } from "../transient-services/matching/matching.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "../types/user.types";
import { User } from "./user.entity";
import { UserService } from "./user.service";

jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("mockedSalt"),
    hash: jest.fn().mockResolvedValue("mockedHash"),
}));
jest.mock("fs", () => ({
    promises: {
        writeFile: jest.fn().mockResolvedValue(undefined),
    },
}));
jest.mock("@nestjs/typeorm", () => ({
    getRepositoryToken: jest
        .fn()
        .mockImplementation((entity) => `Repository_${entity.name}`),
}));

describe("UserService", () => {
    let service: UserService;
    let userRepository: Repository<User>;
    let pendingUserRepository: Repository<PendingUser>;
    let matchingService: MatchingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(BlacklistedRegion),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(PendingUser),
                    useClass: Repository,
                },
                {
                    provide: MatchingService,
                    useValue: {
                        checkAndNotifyMatches: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        blacklistedRegionRepository = module.get<Repository<BlacklistedRegion>>(
            getRepositoryToken(BlacklistedRegion),
        );
        pendingUserRepository = module.get<Repository<PendingUser>>(
            getRepositoryToken(PendingUser),
        );
        matchingService = module.get<MatchingService>(MatchingService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a new user", async () => {
            const createUserDto: CreateUserDTO = {
                firstName: "John",
                email: "john@example.com",
                clearPassword: "password123",
                wantsEmailUpdates: false,
                verificationStatus: EVerificationStatus.PENDING,
                blacklistedRegions: [],
                birthDay: new Date("1990-01-01"),
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
                approachChoice: EApproachChoice.BOTH,
                approachFromTime: new Date(),
                approachToTime: new Date(),
                dateMode: EDateMode.LIVE,
                bio: "Hello, I am John",
            };
            const mockImages: Express.Multer.File[] = [
                {
                    originalname: "0",
                    buffer: Buffer.from("fake-image-data"),
                } as Express.Multer.File,
            ];

            const mockPendingUser = new PendingUser();
            mockPendingUser.email = createUserDto.email;
            mockPendingUser.verificationStatus = EVerificationStatus.VERIFIED;

            jest.spyOn(
                pendingUserRepository,
                "findOneByOrFail",
            ).mockResolvedValue(mockPendingUser);
            jest.spyOn(fs.promises, "writeFile").mockResolvedValue();
            // @ts-expect-error spread operator does not copy interface methods
            jest.spyOn(userRepository, "save").mockResolvedValue({
                id: "1",
                ...createUserDto,
            } as User);

            const result = await service.createUser(createUserDto, mockImages);

            expect(result).toBeDefined();
            expect(result.id).toBe("1");
            expect(result.firstName).toBe(createUserDto.firstName);
            expect(bcrypt.genSalt).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith(
                "password123",
                "mockedSalt",
            );
            expect(userRepository.save).toHaveBeenCalled();
        });
    });

    describe("updateUser", () => {
        it("should update an existing user", async () => {
            const userId = "1";
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
                bio: "Updated bio",
            };
            const mockImages: Express.Multer.File[] = [];

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.bio = "Original bio";

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            // @ts-expect-error spread operator does not copy interface methods
            jest.spyOn(userRepository, "save").mockResolvedValue({
                ...mockUser,
                ...updateUserDto,
            });

            const result = await service.updateUser(
                userId,
                updateUserDto,
                mockImages,
            );

            expect(result).toBeDefined();
            expect(result.firstName).toBe(updateUserDto.firstName);
            expect(result.bio).toBe(updateUserDto.bio);
            expect(userRepository.save).toHaveBeenCalled();
        });

        it("should throw an error if user is not found", async () => {
            const userId = "1";
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
            };

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);

            await expect(
                service.updateUser(userId, updateUserDto),
            ).rejects.toThrow("User not found");
        });
    });

    describe("findUserById", () => {
        it("should return a user by ID", async () => {
            const userId = "1";
            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

            const result = await service.findUserById(userId);

            expect(result).toBeDefined();
            expect(result.id).toBe(userId);
            expect(result.firstName).toBe("John");
        });

        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

            await expect(service.findUserById(userId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("updateLocation", () => {
        it("should update user location and check for matches", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            // @ts-expect-error spread operator does not copy interface methods
            jest.spyOn(userRepository, "save").mockResolvedValue({
                ...mockUser,
                location: { type: "Point", coordinates: [-74.006, 40.7128] },
            });
            jest.spyOn(
                matchingService,
                "checkAndNotifyMatches",
            ).mockResolvedValue();

            const result = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(result).toBeDefined();
            expect(result.location).toEqual({
                type: "Point",
                coordinates: [-74.006, 40.7128],
            });
            expect(userRepository.save).toHaveBeenCalled();
            expect(matchingService.checkAndNotifyMatches).toHaveBeenCalledWith(
                mockUser,
            );
        });

        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);

            await expect(
                service.updateLocation(userId, locationUpdateDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("findUserByEmail", () => {
        it("should return a user by email", async () => {
            const email = "john@example.com";
            const mockUser = new User();
            mockUser.id = "1";
            mockUser.email = email;
            mockUser.firstName = "John";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(mockUser);

            const result = await service.findUserByEmail(email);

            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.firstName).toBe("John");
        });

        it("should throw NotFoundException if user is not found", async () => {
            const email = "nonexistent@example.com";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

            await expect(service.findUserByEmail(email)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("updatePushToken", () => {
        it("should update user push token", async () => {
            const userId = "1";
            const pushToken = "new-push-token";

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            // @ts-expect-error spread operator does not copy interface methods
            jest.spyOn(userRepository, "save").mockResolvedValue({
                ...mockUser,
                pushToken,
            });

            const result = await service.updatePushToken(userId, pushToken);

            expect(result).toBeDefined();
            expect(result.pushToken).toBe(pushToken);
            expect(userRepository.save).toHaveBeenCalled();
        });

        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";
            const pushToken = "new-push-token";

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);

            await expect(
                service.updatePushToken(userId, pushToken),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
