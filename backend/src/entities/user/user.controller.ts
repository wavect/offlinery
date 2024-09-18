import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { Public } from "@/auth/auth.guard";
import { CreateUserRequestDTO } from "@/DTOs/create-user-request.dto";
import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { UpdateUserPasswordDTO } from "@/DTOs/update-user-password";
import { UpdateUserRequestDTO } from "@/DTOs/update-user-request.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { UserDeletionSuccessDTO } from "@/DTOs/user-deletion-success.dto";
import { UserPrivateDTO } from "@/DTOs/user-private.dto";
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
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { CacheTTL } from "@nestjs/common/cache";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
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
    @UsePipes(new ValidationPipe({ transform: true }))
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
    ): Promise<SignInResponseDTO> {
        return await this.userService.createUser(createUserDto, images);
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
    @UsePipes(new ValidationPipe({ transform: true }))
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

    @Put(`changePwd/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiBody({
        type: UpdateUserPasswordDTO,
    })
    @ApiOperation({ summary: "Update user password" })
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateUserPassword(
        @Param(USER_ID_PARAM) userId: string,
        @Body("changePwd", new ParseJsonPipe(UpdateUserDTO))
        changePwdDTO: UpdateUserPasswordDTO,
    ): Promise<UserPublicDTO> {
        return (
            await this.userService.updateUserPassword(userId, changePwdDTO)
        ).convertToPublicDTO();
    }

    @Get(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get private user data by ID" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiResponse({
        status: 200,
        description: "The user has been successfully retrieved.",
        type: UserPrivateDTO,
    })
    @ApiResponse({ status: 404, description: "User not found." })
    async getOwnUserData(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<UserPrivateDTO> {
        this.logger.debug(`Get own user data for UserId: ${userId}`);
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user.convertToPrivateDTO();
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

    @Put(`request-deletion/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Request deletion of user account" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiResponse({
        status: 200,
        description: "Account deletion has been requested successfully.",
    })
    @ApiResponse({ status: 404, description: "User not found." })
    async requestAccountDeletion(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<void> {
        await this.userService.requestAccountDeletion(userId);
    }

    @Get(`delete/:deletionToken`)
    @Public()
    @CacheTTL(0) // @dev disable cache as no return value and one-time action
    @ApiOperation({ summary: "Deletion of user account" })
    @ApiParam({
        name: "deletionToken",
        type: "string",
        description: "Unique, one time and expiring deletion token",
    })
    @ApiResponse({
        status: 200,
        description: "Account has been deleted successfully.",
    })
    @ApiResponse({
        status: 404,
        description: "User not found, deletion token invalid.",
    })
    @ApiResponse({ status: 403, description: "Deletion token expired" })
    async deleteUser(
        @Param("deletionToken") deletionToken: string,
    ): Promise<UserDeletionSuccessDTO> {
        return await this.userService.deleteUserByDeletionToken(deletionToken);
    }
}
