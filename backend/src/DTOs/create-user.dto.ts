import {ApiProperty} from '@nestjs/swagger';
import {EApproachChoice, EDateMode, EVerificationStatus, EGender} from "../types/user.types";
import {BlacklistedRegionDTO} from "./blacklisted-region.dto";

export class CreateUserDTO {
    @ApiProperty({type: 'string'})
    firstName: string;

    @ApiProperty({type: 'string', format: 'email'})
    email: string;

    @ApiProperty({type: 'string'})
    clearPassword: string;

    @ApiProperty({type: 'boolean'})
    wantsEmailUpdates: boolean;

    // only Date, no time
    @ApiProperty({type: 'string', format: 'date' })
    birthDay: Date;

    @ApiProperty({enum: EGender})
    gender: EGender;

    @ApiProperty({enum: EGender})
    genderDesire: EGender;

    @ApiProperty({enum: EVerificationStatus})
    verificationStatus: EVerificationStatus;

    @ApiProperty({enum: EApproachChoice})
    approachChoice: EApproachChoice;


    @ApiProperty({
        type: () => [BlacklistedRegionDTO],
        description: 'Array of blacklisted regions',
        example: [
            {
                latitude: 40.7128,
                longitude: -74.0060,
                radius: 1000
            }
        ],
    })
    blacklistedRegions: BlacklistedRegionDTO[];

    @ApiProperty({type: 'string', format: 'date-time'})
    approachFromTime: Date;

    @ApiProperty({type: 'string', format: 'date-time'})
    approachToTime: Date;

    @ApiProperty({type: 'string'})
    bio: string;

    @ApiProperty({enum: EDateMode})
    dateMode: EDateMode;
}