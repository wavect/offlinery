import { Body, Controller, HttpStatus, Post, Put } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "src/auth/auth.guard";
import { RegistrationForVerificationDTO } from "src/DTOs/registration-for-verification.dto";
import { VerifyEmailDTO } from "src/DTOs/verify-email.dto";
import { RegistrationService } from "./registration.service";

@ApiTags("Registration")
@Controller({
    version: "1",
    path: "registration",
})
export class RegistrationController {
    constructor(private readonly registrationService: RegistrationService) {}

    @Post()
    @Public()
    @ApiOperation({ summary: "Creates a user with only an email to verify." })
    @ApiBody({
        type: RegistrationForVerificationDTO,
        description: "User email.",
    })
    @ApiResponse({
        status: 200,
        description:
            "Email successfully registered. Still needs to be verified.",
        type: RegistrationForVerificationDTO,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: "Email already exists.",
    })
    async registerUserForEmailVerification(
        @Body() emailDto: RegistrationForVerificationDTO,
    ): Promise<RegistrationForVerificationDTO> {
        const email = await this.registrationService.registerPendingUser(
            emailDto.email,
        );
        return { email };
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
