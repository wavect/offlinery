import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BlacklistedRegion } from "../blacklisted-region/blacklisted-region.entity";
import { CreateUserDTO } from "../DTOs/create-user.dto";
import { UpdateUserDTO } from "../DTOs/update-user.dto";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "../types/user.types";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

describe("UserController", () => {
    let userController: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        createUser: jest.fn(),
                        updateUser: jest.fn(),
                        getUserById: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(BlacklistedRegion),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    describe("createUser", () => {
        it("should create a new user with images", async () => {
            const createUserDto: CreateUserDTO = {
                firstName: "John",
                email: "john@example.com",
                clearPassword: "password123",
                wantsEmailUpdates: true,
                birthDay: new Date("1990-01-01"),
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
                verificationStatus: EVerificationStatus.PENDING,
                approachChoice: EApproachChoice.BOTH,
                blacklistedRegions: [
                    {
                        latitude: 40.7128,
                        longitude: -74.006,
                        radius: 1000,
                    },
                ],
                approachFromTime: new Date("2023-01-01T09:00:00"),
                approachToTime: new Date("2023-01-01T17:00:00"),
                bio: "I love hiking and reading",
                dateMode: EDateMode.LIVE,
            };

            const mockImages = [
                {
                    fieldname: "images",
                    originalname: "test1.jpg",
                    encoding: "7bit",
                    mimetype: "image/jpeg",
                    buffer: Buffer.from("fake image data"),
                    size: 1024,
                },
                {
                    fieldname: "images",
                    originalname: "test2.jpg",
                    encoding: "7bit",
                    mimetype: "image/jpeg",
                    buffer: Buffer.from("fake image data"),
                    size: 1024,
                },
            ] as Express.Multer.File[];

            const expectedResult = new User();
            Object.assign(expectedResult, createUserDto);
            expectedResult.id = "1";
            expectedResult.imageURIs = mockImages.map((i) => i.path);
            expectedResult.isActive = true;
            expectedResult.convertToPublicDTO = jest.fn().mockReturnValue({
                id: "1",
                firstName: "John",
                email: "john@example.com",
                // ... other public fields
            });

            (userService.createUser as jest.Mock).mockResolvedValue(
                expectedResult,
            );

            const result = await userController.createUser(
                createUserDto,
                mockImages,
            );

            expect(userService.createUser).toHaveBeenCalledWith(
                createUserDto,
                mockImages,
            );
            expect(result).toEqual(expectedResult.convertToPublicDTO());
        });
    });

    describe("updateUser", () => {
        it("should update an existing user", async () => {
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
                bio: "Updated bio",
            };

            const mockImages = [
                {
                    fieldname: "images",
                    originalname: "test1_updated.jpg",
                    encoding: "7bit",
                    mimetype: "image/jpeg",
                    buffer: Buffer.from("updated fake image data"),
                    size: 1024,
                },
            ] as Express.Multer.File[];

            const expectedResult = new User();
            Object.assign(expectedResult, updateUserDto);
            expectedResult.id = "1";
            expectedResult.imageURIs = mockImages.map((i) => i.path);
            expectedResult.convertToPublicDTO = jest.fn().mockReturnValue({
                id: 1,
                firstName: "John Updated",
                bio: "Updated bio",
                // ... other public fields
            });

            (userService.updateUser as jest.Mock).mockResolvedValue(
                expectedResult,
            );

            const result = await userController.updateUser(
                "1",
                updateUserDto,
                mockImages,
            );

            expect(userService.updateUser).toHaveBeenCalledWith(
                1,
                updateUserDto,
                mockImages,
            );
            expect(result).toEqual(expectedResult.convertToPublicDTO());
        });
    });

    describe("getUser", () => {
        it("should get a user by ID", async () => {
            const userId = "1";
            const expectedUser = new User();
            expectedUser.id = userId;
            expectedUser.firstName = "John";
            expectedUser.email = "john@example.com";
            expectedUser.convertToPublicDTO = jest.fn().mockReturnValue({
                id: userId,
                firstName: "John",
                email: "john@example.com",
                // ... other public fields
            });

            (userService.findUserById as jest.Mock).mockResolvedValue(
                expectedUser,
            );

            const result = await userController.getUser(userId);

            expect(userService.findUserById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(expectedUser.convertToPublicDTO());
        });

        it("should throw NotFoundException when user is not found", async () => {
            const userId = "999";

            (userService.findUserById as jest.Mock).mockResolvedValue(null);

            await expect(userController.getUser(userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(userService.findUserById).toHaveBeenCalledWith(userId);
        });
    });
});
