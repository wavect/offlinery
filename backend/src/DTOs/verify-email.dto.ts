import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyEmailDTO {
    @ApiProperty({ example: "user@example.com" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ example: "123456" })
    @IsString()
    @Length(6, 6)
    verificationCode: string;
}
