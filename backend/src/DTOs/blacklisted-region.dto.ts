
import {ApiProperty} from "@nestjs/swagger";

export class BlacklistedRegionDTO {
    @ApiProperty({
        type: 'object',
        properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' }
        },
        //required: ['latitude', 'longitude'],
        example: { latitude: 40.7128, longitude: -74.0060 }
    })
    center: { latitude: number; longitude: number };

    @ApiProperty({
        type: 'number',
        description: 'Radius of the blacklisted region in meters',
        example: 1000
    })
    radius: number;
}