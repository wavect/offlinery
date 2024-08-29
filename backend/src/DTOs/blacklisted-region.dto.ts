import { ApiProperty } from '@nestjs/swagger';
import { Point } from 'typeorm';

export class BlacklistedRegionDTO {
  @ApiProperty({
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['Point'] },
      coordinates: {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
        maxItems: 2,
      },
    },
    description:
      'GeoJSON Point representing the location of the blacklisted region (0:lon, 1:lat)',
    required: true,
    example: {
      type: 'Point',
      coordinates: [-74.006, 40.7128],
    },
  })
  location: Point;

  @ApiProperty({
    type: 'number',
    description: 'Radius of the blacklisted region in meters',
    example: 1000,
  })
  radius: number;
}
