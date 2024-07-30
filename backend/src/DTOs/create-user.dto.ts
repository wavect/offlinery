
import { ApiProperty } from '@nestjs/swagger';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import {BlacklistedRegionDTO} from "./blacklisted-region.dto";

export class CreateUserDTO {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    clearPassword: string;

    @ApiProperty()
    wantsEmailUpdates: boolean;

    @ApiProperty({ type: 'string', format: 'date' })
    birthDay: Date;

    @ApiProperty({ enum: EGender })
    gender: EGender;

    @ApiProperty({ enum: EGender })
    genderDesire: EGender;

    @ApiProperty({ enum: EVerificationStatus })
    verificationStatus: EVerificationStatus;

    @ApiProperty({ enum: EApproachChoice })
    approachChoice: EApproachChoice;


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
        ]
    })
    blacklistedRegions: BlacklistedRegionDTO[];

    @ApiProperty({ type: 'string', format: 'time' })
    approachFromTime: Date;

    @ApiProperty({ type: 'string', format: 'time' })
    approachToTime: Date;

    @ApiProperty()
    bio: string;

    @ApiProperty({ enum: EDateMode })
    dateMode: EDateMode;
}