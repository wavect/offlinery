import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Point } from "geojson";
import { Repository } from "typeorm";
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

// Mocks
jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("mock-salt"),
    hash: jest.fn().mockResolvedValue("mock-hash"),
}));

jest.mock("fs", () => ({
    promises: {
        writeFile: jest.fn().mockResolvedValue(undefined),
    },
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
}));

jest.mock("path", () => ({
    join: jest.fn().mockImplementation((...args) => args.join("/")),
    resolve: jest.fn().mockImplementation((...args) => args.join("/")),
    extname: jest.fn().mockReturnValue(".jpg"),
    dirname: jest.fn().mockImplementation((path) => {
        const parts = path.split("/");
        return parts.slice(0, -1).join("/");
    }),
}));

jest.mock("uuid", () => ({
    v4: jest.fn().mockReturnValue("mock-uuid"),
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
                    provide: "UserRepository",
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: "BlacklistedRegionRepository",
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: "PendingUserRepository",
                    useValue: {
                        findOneByOrFail: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                        delete: jest.fn(),
                    },
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
        userRepository = module.get("UserRepository");
        pendingUserRepository = module.get("PendingUserRepository");
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
                    mimetype: "image/jpeg",
                } as Express.Multer.File,
            ];

            const mockPendingUser = new PendingUser();
            mockPendingUser.email = createUserDto.email;
            mockPendingUser.verificationStatus = EVerificationStatus.VERIFIED;

            jest.spyOn(
                pendingUserRepository,
                "findOneByOrFail",
            ).mockResolvedValue(mockPendingUser);
            // @ts-expect-error Entity interface methods to be ignored
            jest.spyOn(userRepository, "save").mockResolvedValue({
                id: "1",
                ...createUserDto,
                imageURIs: ["mock-uuid.jpg"],
            } as User);

            const result = await service.createUser(createUserDto, mockImages);

            expect(result).toBeDefined();
            expect(result.id).toBe("1");
            expect(result.firstName).toBe(createUserDto.firstName);
            expect(result.imageURIs).toEqual(["mock-uuid.jpg"]);
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
            jest.spyOn(userRepository, "save").mockResolvedValue({
                ...mockUser,
                ...updateUserDto,
            } as User);

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
            jest.spyOn(userRepository, "save").mockResolvedValue({
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User);
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
            const email = "john@example.com";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

            await expect(service.findUserByEmail(email)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
