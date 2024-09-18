import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
} from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { BlacklistedRegionDTO } from "./blacklisted-region.dto";

export class UpdateUserDTO {
    @ApiProperty({ type: "string", required: false })
    firstName?: string;

    @ApiProperty({ type: "string", format: "email", required: false })
    @Transform(({ value }) => value.toLowerCase())
    email?: string;

    @ApiProperty({ type: "boolean", required: false })
    wantsEmailUpdates?: boolean;

    @ApiProperty({ type: "date", format: "date", required: false })
    birthDay?: Date;

    @ApiProperty({ enum: EGender, required: false })
    gender?: EGender;

    @ApiProperty({ enum: EGender, required: false })
    genderDesire?: EGender;

    @ApiProperty({ enum: EApproachChoice, required: false })
    approachChoice?: EApproachChoice;

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
        required: false,
    })
    blacklistedRegions?: BlacklistedRegionDTO[];

    @ApiProperty({ type: "string", format: "time", required: false })
    approachFromTime?: Date;

    @ApiProperty({ type: "string", format: "time", required: false })
    approachToTime?: Date;

    @ApiProperty({ type: "string", required: false })
    bio?: string;

    @ApiProperty({ enum: EDateMode, required: false })
    dateMode?: EDateMode;

    @ApiProperty({ enum: ELanguage, required: false })
    preferredLanguage?: ELanguage;
}
