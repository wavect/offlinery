import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class RegistrationForVerificationRequestDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    email: string;
}

export class RegistrationForVerificationResponseDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
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
}
