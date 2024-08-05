import { ApiProperty } from "@nestjs/swagger";

export class BlacklistedRegionDTO {
    @ApiProperty({
        type: 'number',
        description: 'Latitude of the center of the blacklisted region',
        required: true,
        example: 40.7128,
    })
    latitude: number;

    @ApiProperty({
        type: 'number',
        description: 'Longitude of the center of the blacklisted region',
        required: true,
        example: -74.0060
    })
    longitude: number;

    @ApiProperty({
        type: 'number',
        description: 'Radius of the blacklisted region in meters',
        example: 1000
    })
    radius: number;
}