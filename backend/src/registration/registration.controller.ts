import { Body, Controller, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { UserPublicDTO } from 'src/DTOs/user-public.dto';
import {
  RegistrationForVerificationDto,
  VerifyEmailDto,
} from 'src/DTOs/registration.dto';
import { Public } from 'src/auth/auth.guard';

@ApiTags('Registration')
@Controller({
  version: '1',
  path: 'registration',
})
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Creates a user with only an email to verify.' })
  @ApiBody({ type: RegistrationForVerificationDto, description: 'User email.' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully registered. Still needs to be verified.',
    type: RegistrationForVerificationDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists.',
  })
  async registerUserForEmailVerification(
    @Body() emailDto: RegistrationForVerificationDto,
  ): Promise<RegistrationForVerificationDto> {
    const email = await this.registrationService.registerPendingUser(
      emailDto.email,
    );
    return { email };
  }

  @Put('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email with verification code.' })
  @ApiBody({
    type: VerifyEmailDto,
    description: 'User email and verification code.',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    return await this.registrationService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.verificationCode,
    );
  }
}
