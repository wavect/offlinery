import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { EVerificationStatus } from 'src/types/user.types';

export class PendingUserPublicDto {
  @ApiProperty({ description: 'The unique identifier of the pending user' })
  id: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({description: 'The verification status of the user'})
  verificationStatus: EVerificationStatus;
}

export class PendingUserRequestDto {
  @ApiProperty({description: 'The email of the user'})
  @IsEmail()
  email: string;

  @ApiProperty({description: 'The verification code entered by the user'})
  verificationCode: string;
}