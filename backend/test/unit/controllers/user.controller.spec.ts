import { AuthService } from "@/auth/auth.service";
import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { JwtStatus } from "@/DTOs/sign-in-response.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { UserController } from "@/entities/user/user.controller";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
    ELanguage,
} from "@/types/user.types";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserBuilder } from "../../_src/builders/user.builder";

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
                {
                    provide: AuthService,
                    useValue: {
                        getJwtTokenForUser: jest.fn(),
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
                blacklistedRegions: [],
                clearPassword: "password123",
                birthDay: new Date("1990-01-01"),
                gender: EGender.MAN,
                genderDesire: [EGender.WOMAN],
                intentions: [EIntention.RELATIONSHIP],
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

            jest.spyOn(userService, "createUser").mockResolvedValue({
                status: JwtStatus.VALID,
                accessToken: "AT",
                user: {
                    ...new UserBuilder().build(),
                    markedForDeletion: false,
                    age: 26,
                    ageRange: [18, 99],
                },
                refreshToken: "RT",
            });

            const result = await controller.createUser(
                createUserDto,
                mockImages,
            );

            expect(result.accessToken).toEqual("AT");
            expect(result.refreshToken).toEqual("RT");
            expect(userService.createUser).toHaveBeenCalledWith(
                createUserDto,
                mockImages,
            );
        });
    });

    describe("updateUser", () => {
        it("should update an existing user", async () => {
            const userId = "1";

            // TODO use builders!
            const updateUserDto: UpdateUserDTO = {
                firstName: "John Updated",
                bio: "Updated bio",
                indexImagesToDelete: [],
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
        it("should throw NotFoundException if user is not found", async () => {
            const userId = "1";

            jest.spyOn(userService, "findUserById").mockResolvedValue(null);

            await expect(controller.getOwnUserData(userId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
