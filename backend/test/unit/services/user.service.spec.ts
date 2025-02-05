import { AuthService } from "@/auth/auth.service";
import { LocationDTO } from "@/DTOs/location.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { AppStatistic } from "@/entities/app-stats/app-stat.entity";
import { AppStatsService } from "@/entities/app-stats/app-stats.service";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EApproachChoice } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Point } from "geojson";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";
import { mockRepository } from "../../_src/utils/utils";

// Mocks
jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("mock-salt"),
    hash: jest.fn().mockResolvedValue("mock-hash"),
}));

describe("UserService", () => {
    let service: UserService;
    let userRepository: jest.Mocked<Record<keyof Repository<User>, jest.Mock>>;
    let matchingService: jest.Mocked<MatchingService>;

    const mockMatchingService = {
        checkForEncounters: jest.fn(),
    };

    const mockAuthService = {
        signIn: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneBy: jest.fn(),
                        findOneByOrFail: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(BlacklistedRegion),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(PendingUser),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Encounter),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(AppStatistic),
                    useValue: mockRepository,
                },
                {
                    provide: MatchingService,
                    useFactory: () => mockMatchingService,
                },
                {
                    provide: AuthService,
                    useFactory: () => mockAuthService,
                },
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn(),
                    },
                },
                {
                    provide: I18nService,
                    useValue: {
                        t: jest.fn(),
                    },
                },
                {
                    provide: AppStatsService,
                    useValue: {
                        t: jest.fn(),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendPushNotifications: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get(getRepositoryToken(User));
        matchingService = module.get(MatchingService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("updateUser", () => {
        it("should update an existing user", async () => {
            const userId = "1";

            // TODO USE BUILDERS
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
                bio: "Updated bio",
                indexImagesToDelete: [],
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

            // TODO USE BUILDERS
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
                indexImagesToDelete: [],
            };

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);

            await expect(
                service.updateUser(userId, updateUserDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("findUserById", () => {
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
            const locationUpdateDto: LocationDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.approachChoice = EApproachChoice.BE_APPROACHED;

            const user = {
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User;

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            jest.spyOn(userRepository, "save").mockResolvedValue(user);

            const checkAndNotifyMatchesSpy = jest
                .spyOn(matchingService, "checkForEncounters")
                .mockResolvedValue(undefined);

            const { updatedUser } = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(updatedUser).toBeDefined();
            expect(updatedUser.location).toEqual({
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
            const locationUpdateDto: LocationDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };

            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";
            mockUser.approachChoice = EApproachChoice.BOTH;

            const user = {
                ...mockUser,
                location: {
                    type: "Point",
                    coordinates: [-74.006, 40.7128],
                } as Point,
            } as User;

            jest.spyOn(userRepository, "findOneBy").mockResolvedValue(mockUser);
            jest.spyOn(userRepository, "save").mockResolvedValue(user);

            const checkAndNotifyMatchesSpy = jest
                .spyOn(matchingService, "checkForEncounters")
                .mockResolvedValue(undefined);

            const { updatedUser } = await service.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(updatedUser).toBeDefined();
            expect(updatedUser.location).toEqual({
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

        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";
            const locationUpdateDto: LocationDTO = {
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

            const result = await service.findUserByEmailOrFail(email);

            expect(result).toBeDefined();
            expect(result.email).toBe(email);
            expect(result.firstName).toBe("John");
        });

        it("should throw NotFoundException if user is not found", async () => {
            const email = "john@example.com";

            jest.spyOn(userRepository, "findOne").mockResolvedValue(null);

            await expect(service.findUserByEmailOrFail(email)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
