import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { EApproachChoice } from "@/types/user.types";
import { NotFoundException } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Point } from "geojson";
import { Repository } from "typeorm";
import { getUnitTestingModule } from "../../_src/modules/unit.testing.module";

// Mocks
jest.mock("bcrypt", () => ({
    genSalt: jest.fn().mockResolvedValue("mock-salt"),
    hash: jest.fn().mockResolvedValue("mock-hash"),
}));

describe("UserService", () => {
    let service: UserService;
    let userRepository: jest.Mocked<Repository<User>>;
    let matchingService: jest.Mocked<MatchingService>;

    beforeEach(async () => {
        const module: TestingModule = await getUnitTestingModule();

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
