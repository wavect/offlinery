
import { ApiProperty } from '@nestjs/swagger';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";

export class CreateUserDto {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    birthDay: Date;

    @ApiProperty({ enum: EGender })
    gender: EGender;

    @ApiProperty({ enum: EGender })
    genderDesire: EGender;

    @ApiProperty({ enum: EVerificationStatus })
    verificationStatus: EVerificationStatus;

    @ApiProperty({ enum: EApproachChoice })
    approachChoice: EApproachChoice;

    @ApiProperty({ type: 'array', items: { type: 'object', properties: { center: { type: 'object', properties: { latitude: { type: 'number' }, longitude: { type: 'number' } } }, radius: { type: 'number' } } } })
    blacklistedRegions: { center: { latitude: number; longitude: number }; radius: number }[];

    @ApiProperty()
    approachFromTime: Date;

    @ApiProperty()
    approachToTime: Date;

    @ApiProperty()
    bio: string;

    @ApiProperty({ enum: EDateMode })
    dateMode: EDateMode;
}