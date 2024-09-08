import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDTO } from "../../../src/DTOs/create-user.dto";
import { LocationUpdateDTO } from "../../../src/DTOs/location-update.dto";
import { UpdateUserDTO } from "../../../src/DTOs/update-user.dto";
import { UserController } from "../../../src/entities/user/user.controller";
import { User } from "../../../src/entities/user/user.entity";
import { UserService } from "../../../src/entities/user/user.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "../../../src/types/user.types";

describe("UserController", () => {
    let controller: UserController;
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
                        findUserById: jest.fn(),
                        updateLocation: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("createUser", () => {
        it("should create a new user", async () => {
            const createUserDto: CreateUserDTO = {
                firstName: "John",
                email: "john@example.com",
                wantsEmailUpdates: false,
                verificationStatus: EVerificationStatus.PENDING,
                blacklistedRegions: [],
                clearPassword: "password123",
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
            const mockImages: Express.Multer.File[] = [];
            const mockUser = new User();
            mockUser.id = "1";
            mockUser.firstName = "John";

            jest.spyOn(userService, "createUser").mockResolvedValue(mockUser);

            const result = await controller.createUser(
                createUserDto,
                mockImages,
            );

            expect(result).toEqual(mockUser.convertToPublicDTO());
            expect(userService.createUser).toHaveBeenCalledWith(
                createUserDto,
                mockImages,
            );
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
            mockUser.firstName = "John Updated";

            jest.spyOn(userService, "updateUser").mockResolvedValue(mockUser);

            const result = await controller.updateUser(
                userId,
                updateUserDto,
                mockImages,
            );

            expect(result).toEqual(mockUser.convertToPublicDTO());
            expect(userService.updateUser).toHaveBeenCalledWith(
                userId,
                updateUserDto,
                mockImages,
            );
        });
    });

    describe("getUser", () => {
        it("should return a user by ID", async () => {
            const userId = "1";
            const mockUser = new User();
            mockUser.id = userId;
            mockUser.firstName = "John";

            jest.spyOn(userService, "findUserById").mockResolvedValue(mockUser);

            const result = await controller.getUser(userId);

            expect(result).toEqual(mockUser.convertToPublicDTO());
            expect(userService.findUserById).toHaveBeenCalledWith(userId);
        });

        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";

            jest.spyOn(userService, "findUserById").mockResolvedValue(null);

            await expect(controller.getUser(userId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("updateLocation", () => {
        it("should update user location", async () => {
            const userId = "1";
            const locationUpdateDto: LocationUpdateDTO = {
                latitude: 40.7128,
                longitude: -74.006,
            };
            const mockUser = new User();
            mockUser.id = userId;
            mockUser.location = {
                type: "Point",
                coordinates: [-74.006, 40.7128],
            };

            jest.spyOn(userService, "updateLocation").mockResolvedValue(
                mockUser,
            );

            const result = await controller.updateLocation(
                userId,
                locationUpdateDto,
            );

            expect(result).toEqual(mockUser.convertToPublicDTO());
            expect(userService.updateLocation).toHaveBeenCalledWith(
                userId,
                locationUpdateDto,
            );
        });
    });
});
