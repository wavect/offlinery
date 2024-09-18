import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail } from "class-validator";

export class RegistrationForVerificationRequestDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;
}

export class RegistrationForVerificationResponseDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({
        description:
            "The timeout when the user can resend a verification code in milliseconds.",
    })
    timeout: number;

    @ApiProperty({
        description: "Timestamp when the verification code was issued.",
    })
    verificationCodeIssuedAt: Date;

    /** @dev This allows us to jump past another email verification is email already verified, but user not yet created. */
    @ApiProperty()
    @IsBoolean()
    alreadyVerifiedButNotRegistered: boolean;
}
