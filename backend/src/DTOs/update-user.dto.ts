import { ApiProperty } from '@nestjs/swagger';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import { BlacklistedRegionDTO } from "./blacklisted-region.dto";

export class UpdateUserDTO {
    @ApiProperty({ required: false })
    firstName?: string;

    @ApiProperty({ required: false })
    email?: string;

    @ApiProperty({ required: false })
    wantsEmailUpdates?: boolean;

    @ApiProperty({ type: 'string', format: 'date', required: false })
    birthDay?: Date;

    @ApiProperty({ enum: EGender, required: false })
    gender?: EGender;

    @ApiProperty({ enum: EGender, required: false })
    genderDesire?: EGender;

    @ApiProperty({ enum: EVerificationStatus, required: false })
    verificationStatus?: EVerificationStatus;

    @ApiProperty({ enum: EApproachChoice, required: false })
    approachChoice?: EApproachChoice;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                center: {
                    type: 'object',
                    properties: {
                        latitude: { type: 'number' },
                        longitude: { type: 'number' }
                    },
                    required: ['latitude', 'longitude']
                },
                radius: { type: 'number' }
            },
            required: ['center', 'radius']
        },
        description: 'Array of blacklisted regions',
        example: [
            {
                center: { latitude: 40.7128, longitude: -74.0060 },
                radius: 1000
            }
        ],
        required: false
    })
    blacklistedRegions?: BlacklistedRegionDTO[];

    @ApiProperty({ type: 'string', format: 'time', required: false })
    approachFromTime?: Date;

    @ApiProperty({ type: 'string', format: 'time', required: false })
    approachToTime?: Date;

    @ApiProperty({ required: false })
    bio?: string;

    @ApiProperty({ enum: EDateMode, required: false })
    dateMode?: EDateMode;
}