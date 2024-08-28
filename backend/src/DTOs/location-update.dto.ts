import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class LocationUpdateDTO {
    @ApiProperty({
        description: 'Latitude of the user\'s location',
        example: 40.7128,
        minimum: -90,
        maximum: 90,
    })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({
        description: 'Longitude of the user\'s location',
        example: -74.0060,
        minimum: -180,
        maximum: 180,
    })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
}