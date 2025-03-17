import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class UserCountDTO {
    @ApiProperty({
        description: "Amount of users",
    })
    @IsNumber()
    @Min(0)
    userCount: number;
}
