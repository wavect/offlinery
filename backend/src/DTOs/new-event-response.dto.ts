import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class NewEventResponseDTO {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    ok: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    error: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    noPushToken: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    total: number;
}
