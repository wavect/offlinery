import { LocationDTO } from "@/DTOs/location.dto";
import { ApiProperty } from "@nestjs/swagger";

export class EventPublicDTO {
    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    startDate: string;

    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    startTime: string;

    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    endTime: string;

    @ApiProperty({
        nullable: false,
        required: true,
    })
    venueWithArticleIfNeeded: string;

    @ApiProperty({
        nullable: false,
        required: true,
    })
    address: string;

    @ApiProperty({
        nullable: true,
        type: LocationDTO,
        description: "Location of event",
    })
    location: LocationDTO;
}
