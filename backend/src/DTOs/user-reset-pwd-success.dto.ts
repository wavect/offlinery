import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UserResetPwdSuccessDTO {
    @ApiProperty({ description: "User id." })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: "Password reset status." })
    @IsBoolean()
    @IsNotEmpty()
    passwordReset: boolean;
}
