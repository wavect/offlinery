import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class MissedEqCallDTO {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: false,
        required: true,
    })
    plannedDateTime: Date;
}
