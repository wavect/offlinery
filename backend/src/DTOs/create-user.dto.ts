import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "../types/user.types";
import { BlacklistedRegionDTO } from "./blacklisted-region.dto";

export class CreateUserDTO {
    @ApiProperty({ type: "string" })
    firstName: string;

    @ApiProperty({ type: "string", format: "email" })
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ type: "string" })
    clearPassword: string;

    @ApiProperty({ type: "boolean" })
    wantsEmailUpdates: boolean;

    // only Date, no time
    @ApiProperty({ type: "string", format: "date" })
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
        type: () => [BlacklistedRegionDTO],
        description: "Array of blacklisted regions",
        example: [
            {
                latitude: 40.7128,
                longitude: -74.006,
                radius: 1000,
            },
        ],
        required: false, // optional, since approachers don't have this to fill out on registration
    })
    blacklistedRegions: BlacklistedRegionDTO[];

    @ApiProperty({ type: "string", format: "date-time" })
    approachFromTime: Date;

    @ApiProperty({ type: "string", format: "date-time" })
    approachToTime: Date;

    @ApiProperty({ type: "string" })
    bio: string;

    @ApiProperty({ enum: EDateMode })
    dateMode: EDateMode;

    @ApiProperty({ enum: ELanguage })
    preferredLanguage: ELanguage;
}
