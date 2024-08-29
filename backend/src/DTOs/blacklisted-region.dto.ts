import { ApiProperty } from "@nestjs/swagger";
import { Point } from "typeorm";

export class BlacklistedRegionDTO {
    @ApiProperty({
        type: 'object',
        description: 'GeoJSON Point representing the location of the blacklisted region',
        required: true,
        example: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128]
        }
    })
    location: Point;

    @ApiProperty({
        type: 'number',
        description: 'Radius of the blacklisted region in meters',
        example: 1000
    })
    radius: number;
}