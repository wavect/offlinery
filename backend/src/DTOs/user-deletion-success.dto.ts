import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UserDeletionSuccessDTO {
    @ApiProperty({ description: "Former user id." })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: "User facing status of account." })
    @IsBoolean()
    @IsNotEmpty()
    dataDeleted: boolean;
}
