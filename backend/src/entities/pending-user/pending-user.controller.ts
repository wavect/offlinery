import { OnlyValidRegistrationSession } from "@/auth/auth-registration-session";
import { OnlyAdmin, Public } from "@/auth/auth.guard";
import { MissedEqCallDTO } from "@/DTOs/missed-eq-call.dto";
import {
    RegistrationForVerificationRequestDTO,
    RegistrationForVerificationResponseDTO,
} from "@/DTOs/registration-for-verification.dto";
import { SetAcceptedSpecialDataGenderLookingForDTO } from "@/DTOs/set-accepted-special-data-gender-looking-for.dto";
import { UpdateUserVerificationstatusDTO } from "@/DTOs/update-user-verificationstatus.dto";
import { VerifyEmailDTO } from "@/DTOs/verify-email.dto";
import {
    Body,
    Controller,
    HttpStatus,
    Logger,
    Post,
    Put,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { PendingUserService } from "./pending-user.service";

@ApiTags("PendingUser")
@Controller({
    version: "1",
    path: "pending-user",
})
export class PendingUserController {
    private readonly logger = new Logger(PendingUserController.name);

    constructor(private readonly pendingUserService: PendingUserService) {}

    @Post()
    @Public()
    @ApiOperation({ summary: "Creates a user with only an email to verify." })
    @ApiBody({
        type: RegistrationForVerificationRequestDTO,
        description: "User email.",
    })
    @ApiResponse({
        status: 200,
        description:
            "Email successfully registered. Still needs to be verified.",
        type: RegistrationForVerificationResponseDTO,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: "Email already exists.",
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async registerUserForEmailVerification(
        @Body() emailDto: RegistrationForVerificationRequestDTO,
    ): Promise<RegistrationForVerificationResponseDTO> {
        this.logger.debug(`User registers his email: ${emailDto.email}`);
        return await this.pendingUserService.registerPendingUser(emailDto);
    }

    @Put("verify-email")
    @Public()
    @ApiOperation({ summary: "Verify email with verification code." })
    @ApiBody({
        type: VerifyEmailDTO,
        description: "User email and verification code.",
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO): Promise<void> {
        return await this.pendingUserService.verifyEmail(
            verifyEmailDto.email,
            verifyEmailDto.verificationCode,
        );
    }

    @Put("accept-special-data")
    @OnlyValidRegistrationSession()
    @ApiOperation({ summary: "Accept special data privacy" })
    @ApiBody({
        type: SetAcceptedSpecialDataGenderLookingForDTO,
        description: "Accept special data privacy",
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async setAcceptedSpecialDataGenderLookingForAt(
        @Body()
        setAcceptedSpecialDataGenderLookingForAtDTO: SetAcceptedSpecialDataGenderLookingForDTO,
    ) {
        return await this.pendingUserService.setAcceptedSpecialDataGenderLookingForAt(
            setAcceptedSpecialDataGenderLookingForAtDTO.email,
            setAcceptedSpecialDataGenderLookingForAtDTO.dateTimeAccepted,
        );
    }

    @Put("admin/verification-status")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Update verification status of user." })
    @ApiBody({
        type: UpdateUserVerificationstatusDTO,
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async changeVerificationStatus(
        @Body() updateStatus: UpdateUserVerificationstatusDTO,
    ): Promise<void> {
        return await this.pendingUserService.changeVerificationStatus(
            updateStatus.email,
            updateStatus.newVerificationStatus,
        );
    }

    @Put("admin/missed-eq-call")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({
        summary: "Send reminder to user that they missed the EQ/Safety call.",
    })
    @ApiBody({
        type: MissedEqCallDTO,
    })
    @UsePipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )
    async sendMissedEQCallReminder(
        @Body() missedEQCall: MissedEqCallDTO,
    ): Promise<void> {
        return await this.pendingUserService.sendMissedEQCallReminder(
            missedEQCall.email,
            missedEQCall.plannedDateTime,
        );
    }
}
