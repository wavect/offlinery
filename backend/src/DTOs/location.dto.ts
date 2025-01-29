import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class LocationDTO {
    @ApiProperty({
        description: "Latitude of the user's location",
        example: 40.7128,
        minimum: -90,
        maximum: 90,
    })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({
        description: "Longitude of the user's location",
        example: -74.006,
        minimum: -180,
        maximum: 180,
    })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
}

// @dev To ensure the naming of the generated dto is the same client side (otherwise would break older app versions locationTask)
export class LocationUpdateDTO extends LocationDTO {}
