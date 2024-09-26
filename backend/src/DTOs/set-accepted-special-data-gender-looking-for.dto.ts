import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class SetAcceptedSpecialDataGenderLookingForDTO {
    @ApiProperty({ type: "string", format: "email" })
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: true,
        required: false,
    })
    dateTimeAccepted: Date;
}
