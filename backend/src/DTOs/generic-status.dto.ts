import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class GenericStatusDTO {
    @ApiProperty({ description: "User facing status." })
    @IsBoolean()
    @IsNotEmpty()
    success: boolean;

    @ApiProperty({ description: "Additional information about the response." })
    info: string;
}
