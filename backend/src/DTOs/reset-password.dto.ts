import { EmailCodeResponseADTO } from "@/DTOs/abstract/email-code-response.adto";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class ResetPasswordRequestDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;
}

export class ResetPasswordResponseDTO extends EmailCodeResponseADTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;
}
