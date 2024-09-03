import {
    Body,
    Controller,
    HttpStatus,
    Logger,
    Post,
    Put,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "src/auth/auth.guard";
import {
    RegistrationForVerificationRequestDTO,
    RegistrationForVerificationResponseDTO,
} from "src/DTOs/registration-for-verification.dto";
import { VerifyEmailDTO } from "src/DTOs/verify-email.dto";
import { RegistrationService } from "./registration.service";

@ApiTags("Registration")
@Controller({
    version: "1",
    path: "registration",
})
export class RegistrationController {
    private readonly logger = new Logger(RegistrationController.name);

    constructor(private readonly registrationService: RegistrationService) {}

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
    async registerUserForEmailVerification(
        @Body() emailDto: RegistrationForVerificationRequestDTO,
    ): Promise<RegistrationForVerificationResponseDTO> {
        this.logger.debug(`User registers his email: ${emailDto.email}`);
        return await this.registrationService.registerPendingUser(
            emailDto.email,
        );
    }

    @Put("verify-email")
    @Public()
    @ApiOperation({ summary: "Verify email with verification code." })
    @ApiBody({
        type: VerifyEmailDTO,
        description: "User email and verification code.",
    })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDTO): Promise<void> {
        return await this.registrationService.verifyEmail(
            verifyEmailDto.email,
            verifyEmailDto.verificationCode,
        );
    }
}
