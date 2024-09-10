import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInDTO {
    @ApiProperty({ type: "string" })
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ type: "string" })
    @IsNotEmpty()
    clearPassword: string;
}
