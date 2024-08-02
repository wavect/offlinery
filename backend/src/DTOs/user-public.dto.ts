import { ApiProperty } from '@nestjs/swagger';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";

export class UserPublicDTO {
    @ApiProperty({ description: 'The unique identifier of the user' })
    id: number;

    @ApiProperty({ description: 'Indicates if the user account is active' })
    isActive: boolean;

    @ApiProperty({ description: 'The first name of the user' })
    firstName: string;

    @ApiProperty({ description: 'Indicates if the user wants to receive email updates' })
    wantsEmailUpdates: boolean;

    @ApiProperty({ description: 'The birth date of the user' })
    birthDay: Date;

    @ApiProperty({ enum: EGender, description: 'The gender of the user' })
    gender: EGender;

    @ApiProperty({ enum: EGender, description: 'The gender the user is interested in' })
    genderDesire: EGender;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                filename: { type: 'string' },
                mimetype: { type: 'string' }
            }
        },
        description: 'Array of user images (excluding sensitive path information)'
    })
    images: { filename: string; mimetype: string }[];

    @ApiProperty({ enum: EVerificationStatus, description: 'The verification status of the user' })
    verificationStatus: EVerificationStatus;

    @ApiProperty({ enum: EApproachChoice, description: 'The approach choice of the user' })
    approachChoice: EApproachChoice;

    @ApiProperty({ description: 'The time from which the user can be approached' })
    approachFromTime: Date;

    @ApiProperty({ description: 'The time until which the user can be approached' })
    approachToTime: Date;

    @ApiProperty({ description: 'The user\'s bio' })
    bio: string;

    @ApiProperty({ enum: EDateMode, description: 'The date mode of the user' })
    dateMode: EDateMode;
}