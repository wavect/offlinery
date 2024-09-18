import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateUserPasswordDTO {
    @ApiProperty({ type: "string" })
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({ type: "string" })
    @IsNotEmpty()
    newPassword: string;
}
