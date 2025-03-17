import { LocationDTO } from "@/DTOs/location.dto";
import { MultiLingStringDTO } from "@/DTOs/multi-ling-string.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, ValidateNested } from "class-validator";

export class NewEventDTO {
    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    @IsNotEmpty()
    eventKey: string;

    @ApiProperty({
        nullable: false,
        required: true,
        type: LocationDTO,
        description: "Location of event",
    })
    @ValidateNested()
    @Type(() => LocationDTO)
    location: LocationDTO;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: false,
        required: true,
    })
    @IsDate()
    eventStartDateTime: Date;

    @ApiProperty({
        type: "string",
        format: "date-time",
        nullable: false,
        required: true,
    })
    @IsDate()
    eventEndDateTime: Date;

    @ApiProperty({
        nullable: false,
        required: true,
        type: MultiLingStringDTO,
        format: "json",
    })
    @Type(() => MultiLingStringDTO)
    @IsNotEmpty()
    venueWithArticleIfNeeded: MultiLingStringDTO;

    @ApiProperty({
        nullable: false,
        required: true,
        type: MultiLingStringDTO,
        format: "json",
    })
    @Type(() => MultiLingStringDTO)
    @IsNotEmpty()
    address: MultiLingStringDTO;

    @ApiProperty({
        type: "string",
        nullable: false,
        required: true,
    })
    @IsNotEmpty()
    mapsLink: string;
}
