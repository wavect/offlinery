import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class GenericApiStatusDTO {
    @ApiProperty({ description: "Request status." })
    @IsBoolean()
    @IsNotEmpty()
    requestSuccessful: boolean;
}
