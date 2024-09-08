import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Point } from "geojson";
import { I18nService } from "nestjs-i18n";
import { DataSource, Repository } from "typeorm";
import { CreateUserDTO } from "../../../src/DTOs/create-user.dto";
import { LocationUpdateDTO } from "../../../src/DTOs/location-update.dto";
import { UpdateUserDTO } from "../../../src/DTOs/update-user.dto";
import { BlacklistedRegion } from "../../../src/entities/blacklisted-region/blacklisted-region.entity";
import { EncounterService } from "../../../src/entities/encounter/encounter.service";
import { PendingUser } from "../../../src/entities/pending-user/pending-user.entity";
import { User } from "../../../src/entities/user/user.entity";
import { UserService } from "../../../src/entities/user/user.service";
import { MatchingService } from "../../../src/transient-services/matching/matching.service";
import { NotificationService } from "../../../src/transient-services/notification/notification.service";
import {
    EApproachChoice,
    EDateMode,
    EEmailVerificationStatus,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "../../../src/types/user.types";

// Mocks
jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("mock-salt"),
    hash: jest.fn().mockResolvedValue("mock-hash"),
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
                MatchingService,
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn().mockReturnValue("Translated text"),
                    },
                },
                {
                    provide: EncounterService,
                    useValue: {
                        saveEncountersForUser: jest.fn(),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendPushNotification: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(PendingUser),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(BlacklistedRegion),
                    useClass: Repository,
                },
                {
                    provide: DataSource,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
                preferredLanguage: ELanguage.en,
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
            mockPendingUser.verificationStatus =
                EEmailVerificationStatus.VERIFIED;

            jest.spyOn(
                pendingUserRepository,
                "findOneByOrFail",
            ).mockResolvedValue(mockPendingUser);
            jest.spyOn(userRepository, "save").mockResolvedValue({
                id: "1",
                ...createUserDto,
                isActive: true,
                passwordHash: "abc",
                passwordSalt: "cde",
                refreshToken: "aa",
                refreshTokenExpires: new Date(),
                pushToken: "aa",
                receivedReports: [],
                issuedReports: [],
                encounters: [],
                location: null,
                imageURIs: ["mock-uuid.jpg"],
            } as any as User);

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
            ).rejects.toThrow(NotFoundException);
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
        it("should update user location and check for matches when approachChoice is BE_APPROACHED", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.approachChoice = EApproachChoice.BE_APPROACHED;

            const updatedUser = {
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User;

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            jest.spyOn(userRepository, "save").mockResolvedValue(updatedUser);

            const checkAndNotifyMatchesSpy = jest
                .spyOn(matchingService, "checkAndNotifyMatches")
                .mockResolvedValue(undefined);

            const result = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(result).toBeDefined();
            expect(result.location).toEqual({
                type: "Point",
                coordinates: [-74.006, 40.7128],
            });
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: userId,
                    firstName: "John",
                    location: {
                        type: "Point",
                        coordinates: [-74.006, 40.7128],
                    },
                }),
            );
            expect(checkAndNotifyMatchesSpy).toHaveBeenCalledWith(mockUser);
        });

        it("should update user location and check for matches when approachChoice is BOTH", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.approachChoice = EApproachChoice.BOTH;

            const updatedUser = {
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User;

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            jest.spyOn(userRepository, "save").mockResolvedValue(updatedUser);

            const checkAndNotifyMatchesSpy = jest
                .spyOn(matchingService, "checkAndNotifyMatches")
                .mockResolvedValue(undefined);

            const result = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(result).toBeDefined();
            expect(result.location).toEqual({
                type: "Point",
                coordinates: [-74.006, 40.7128],
            });
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: userId,
                    firstName: "John",
                    location: {
                        type: "Point",
                        coordinates: [-74.006, 40.7128],
                    },
                }),
            );
            expect(checkAndNotifyMatchesSpy).toHaveBeenCalledWith(mockUser);
        });

        it("should update user location but not check for matches when approachChoice is APPROACH", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.approachChoice = EApproachChoice.APPROACH;

            const updatedUser = {
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User;

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            jest.spyOn(userRepository, "save").mockResolvedValue(updatedUser);

            const checkAndNotifyMatchesSpy = jest
                .spyOn(matchingService, "checkAndNotifyMatches")
                .mockResolvedValue(undefined);

            const result = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(result).toBeDefined();
            expect(result.location).toEqual({
                type: "Point",
                coordinates: [-74.006, 40.7128],
            });
            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: userId,
                    firstName: "John",
                    location: {
                        type: "Point",
                        coordinates: [-74.006, 40.7128],
                    },
                }),
            );
            expect(checkAndNotifyMatchesSpy).not.toHaveBeenCalled();
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
