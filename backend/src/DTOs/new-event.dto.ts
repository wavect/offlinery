import { MultiLingStringDTO } from "@/DTOs/multi-ling-string.dto";
import { ApiProperty } from "@nestjs/swagger";

export class NewEventDTO {
    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    eventKey: string;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: false,
        required: true,
    })
    eventStartDateTime: Date;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: false,
        required: true,
    })
    eventEndDateTime: Date;

    @ApiProperty({
        nullable: false,
        required: true,
        type: MultiLingStringDTO,
        format: "json",
    })
    venueWithArticleIfNeeded: MultiLingStringDTO;

    @ApiProperty({
        nullable: false,
        required: true,
        type: MultiLingStringDTO,
        format: "json",
    })
    address: MultiLingStringDTO;

    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    mapsLink: string;
}
