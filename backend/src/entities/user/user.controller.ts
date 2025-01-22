import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { OnlyValidRegistrationSession } from "@/auth/auth-registration-session";
import { Public } from "@/auth/auth.guard";
import { CreateUserRequestDTO } from "@/DTOs/create-user-request.dto";
import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { RequestAccountDeletionViaFormDTO } from "@/DTOs/request-account-deletion-via-form.dto";
import {
    ResetPasswordRequestDTO,
    ResetPasswordResponseDTO,
} from "@/DTOs/reset-password.dto";
import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { UpdateUserPasswordDTO } from "@/DTOs/update-user-password";
import { UpdateUserRequestDTO } from "@/DTOs/update-user-request.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { UserDeletionSuccessDTO } from "@/DTOs/user-deletion-success.dto";
import { UserPrivateDTO } from "@/DTOs/user-private.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { UserRequestDeletionFormSuccessDTO } from "@/DTOs/user-request-deletion-form-success.dto";
import { UserResetPwdSuccessDTO } from "@/DTOs/user-reset-pwd-success.dto";
import { VerifyResetPasswordDTO } from "@/DTOs/verify-password-reset.dto";
import { CustomParseFilePipe } from "@/pipes/custom-parse-file.pipe";
import { ParseValidateJsonPipe } from "@/pipes/parse-validate-json.pipe";
import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    MaxFileSizeValidator,
    NotFoundException,
    Param,
    Post,
    Put,
    Render,
    Res,
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
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller({
    version: "1",
    path: "user",
})
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @OnlyValidRegistrationSession()
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
        /** @dev In Multipart requests, the Body needs to be separately parsed based on the property name in the RequestDTO! */
        @Body("createUserDTO", new ParseValidateJsonPipe(CreateUserDTO))
        createUserDTO: CreateUserDTO,
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
        return await this.userService.createUser(createUserDTO, images);
    }

    @Put(`data/:${USER_ID_PARAM}`)
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
        /** @dev In Multipart requests, the Body needs to be separately parsed based on the property name in the RequestDTO! */
        @Body("updateUserDTO", new ParseValidateJsonPipe(UpdateUserDTO))
        updateUserDTO: UpdateUserDTO,
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
        this.logger.debug(
            `User ${userId} tries to update his own data.`,
            JSON.stringify(updateUserDTO),
        );
        return (
            await this.userService.updateUser(userId, updateUserDTO, images)
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
        @Body() changePwdDTO: UpdateUserPasswordDTO,
    ): Promise<UserPublicDTO> {
        this.logger.debug(`User ${userId} tries to change password.`);
        return (
            await this.userService.updateUserPassword(userId, changePwdDTO)
        ).convertToPublicDTO();
    }

    @Get(`data/:${USER_ID_PARAM}`)
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
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateLocation(
        @Param(USER_ID_PARAM) userId: string,
        @Body() locationUpdateDTO: LocationUpdateDTO,
    ): Promise<UserPublicDTO> {
        const { updatedUser } = await this.userService.updateLocation(
            userId,
            locationUpdateDTO,
        );
        return updatedUser.convertToPublicDTO();
    }

    @Put(`password-forgotten`)
    @Public()
    @ApiOperation({ summary: "Request change password of user account" })
    @ApiBody({
        type: ResetPasswordRequestDTO,
        description: "User email and reset code sent via email.",
    })
    @ApiResponse({
        status: 200,
        type: ResetPasswordResponseDTO,
        description: "Account password change has been requested successfully.",
    })
    @ApiResponse({ status: 404, description: "User not found." })
    async requestPasswordChangeAsForgotten(
        @Body() resetPwdRequestDTO: ResetPasswordRequestDTO,
    ): Promise<ResetPasswordResponseDTO> {
        const { email } = resetPwdRequestDTO;
        return this.userService.requestPasswordChangeAsForgotten(email);
    }

    @Put(`reset-password`)
    @Public()
    @ApiOperation({ summary: "Reset password of user account" })
    @ApiBody({
        type: VerifyResetPasswordDTO,
        description:
            "User email and reset code sent via email including new chosen password.",
    })
    @ApiResponse({
        status: 200,
        description: "Account password has been reset successfully.",
        type: UserResetPwdSuccessDTO,
    })
    @ApiResponse({
        status: 404,
        description: "User not found, reset password token invalid.",
    })
    @ApiResponse({ status: 403, description: "Reset password token expired" })
    @UsePipes(new ValidationPipe({ transform: true }))
    async resetPassword(
        @Body() verifyResetPasswordDTO: VerifyResetPasswordDTO,
    ): Promise<UserResetPwdSuccessDTO> {
        const { email, verificationCode, newClearPassword } =
            verifyResetPasswordDTO;
        return await this.userService.changeUserPasswordByResetPwdLink(
            email,
            verificationCode,
            newClearPassword,
        );
    }

    @Get("request-deletion")
    @Public()
    @Render("request-account-deletion")
    getAccountDeletionForm(@Res() res: Response) {
        const nonce = uuidv4();
        res.setHeader(
            "Content-Security-Policy",
            `script-src 'self' 'nonce-${nonce}'`,
        );
        return {
            title: "Request Account Deletion | Offlinery",
            nonce: nonce,
        };
    }

    @Post(`request-deletion`)
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Request deletion of user account" })
    @ApiBody({ type: RequestAccountDeletionViaFormDTO })
    @ApiResponse({
        status: 200,
        description: "Account deletion request from form has been processed.",
    })
    @ApiResponse({
        status: 400,
        description: "Invalid email provided.",
    })
    async requestAccountDeletionViaForm(
        @Body()
        requestAccountDeletionViaFormDTO: RequestAccountDeletionViaFormDTO,
    ): Promise<UserRequestDeletionFormSuccessDTO> {
        return await this.userService.requestAccountDeletionViaForm(
            requestAccountDeletionViaFormDTO.email,
        );
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
        await this.userService.requestAccountDeletionViaApp(userId);
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
    @Render("account-deletion-confirmation")
    @ApiResponse({
        status: 404,
        description: "User not found, deletion token invalid.",
    })
    @ApiResponse({ status: 403, description: "Deletion token expired" })
    async deleteUser(
        @Param("deletionToken") deletionToken: string,
        @Res() res: Response,
    ): Promise<UserDeletionSuccessDTO & { nonce: string }> {
        const nonce = uuidv4();
        res.setHeader(
            "Content-Security-Policy",
            `script-src 'self' 'nonce-${nonce}'`,
        );
        const deletion =
            await this.userService.deleteUserByDeletionToken(deletionToken);
        return {
            ...deletion,
            nonce,
        };
    }
}
