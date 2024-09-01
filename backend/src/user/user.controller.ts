import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { Public } from "@/auth/auth.guard";
import { CreateUserRequestDTO } from "@/DTOs/create-user-request.dto";
import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { UpdateUserRequestDTO } from "@/DTOs/update-user-request.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { CustomParseFilePipe } from "@/pipes/CustomParseFile.pipe";
import { ParseJsonPipe } from "@/pipes/ParseJson.pipe";
import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    Logger,
    MaxFileSizeValidator,
    NotFoundException,
    Param,
    Post,
    Put,
    UploadedFiles,
    UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller({
    version: "1",
    path: "user",
})
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Public()
    @Post("create")
    @UseInterceptors(FilesInterceptor("images", 6))
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: CreateUserRequestDTO,
        description: "User data and images",
    })
    @ApiOperation({ summary: "Create a new user with images" })
    async createUser(
        @Body("user", new ParseJsonPipe(CreateUserDTO))
        createUserDto: CreateUserDTO,
        @UploadedFiles(
            new CustomParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 100 * 1024 * 1024,
                        message: "Max file size of 100 MB exceeded",
                    }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                ],
            }),
        )
        images: Express.Multer.File[],
    ): Promise<UserPublicDTO> {
        return (
            await this.userService.createUser(createUserDto, images)
        ).convertToPublicDTO();
    }

    @Put(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @UseInterceptors(FilesInterceptor("images", 6))
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: UpdateUserRequestDTO,
        description: "User data and images",
    })
    @ApiOperation({ summary: "Update an existing user" })
    async updateUser(
        @Param(USER_ID_PARAM) userId: string,
        @Body("user", new ParseJsonPipe(UpdateUserDTO))
        updateUserDto: UpdateUserDTO,
        @UploadedFiles(
            new CustomParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({
                        maxSize: 100 * 1024 * 1024,
                        message: "Max file size of 100 MB exceeded",
                    }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                ],
                fileIsRequired: false,
            }),
        )
        images?: Express.Multer.File[],
    ): Promise<UserPublicDTO> {
        return (
            await this.userService.updateUser(userId, updateUserDto, images)
        ).convertToPublicDTO();
    }

    @Get(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get a user by ID" })
    @ApiParam({ name: USER_ID_PARAM, type: "number", description: "User ID" })
    @ApiResponse({
        status: 200,
        description: "The user has been successfully retrieved.",
        type: User,
    })
    @ApiResponse({ status: 404, description: "User not found." })
    async getUser(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<UserPublicDTO> {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user.convertToPublicDTO();
    }

    @Put(`location/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Update user location" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: LocationUpdateDTO })
    @ApiResponse({
        status: 200,
        description: "The user location has been successfully updated.",
        type: UserPublicDTO,
    })
    @ApiResponse({ status: 404, description: "User not found." })
    async updateLocation(
        @Param(USER_ID_PARAM) userId: string,
        @Body() locationUpdateDTO: LocationUpdateDTO,
    ): Promise<UserPublicDTO> {
        const updatedUser = await this.userService.updateLocation(
            userId,
            locationUpdateDTO,
        );
        return updatedUser.convertToPublicDTO();
    }
}
