import { EmailCodeResponseADTO } from "@/DTOs/abstract/email-code-response.adto";
import { ELanguage } from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty } from "class-validator";

export class RegistrationForVerificationRequestDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ enum: ELanguage })
    @IsNotEmpty()
    language: ELanguage;
}

export class RegistrationForVerificationResponseDTO extends EmailCodeResponseADTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    /** @dev This allows us to jump past another email verification is email already verified, but user not yet created. */
    @ApiProperty()
    @IsBoolean()
    alreadyVerifiedButNotRegistered: boolean;

    /** @dev This is NOT the regular authentication session token */
    @ApiProperty()
    registrationJWToken: string;
}
