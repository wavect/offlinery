import { ApiProperty } from "@nestjs/swagger";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EGenderDesire,
    EVerificationStatus,
} from "../types/user.types";
import { BlacklistedRegionDTO } from "./blacklisted-region.dto";
import { UserPublicDTO } from "./user-public.dto";

/** @dev Supposed to be only viewable by actual user him/herself. */
export class UserPrivateDTO extends UserPublicDTO {
    @ApiProperty({ description: "Indicates if the user account is active" })
    isActive: boolean;

    @ApiProperty({ description: "The unique email of the user" })
    email: string;

    @ApiProperty({
        description: "Indicates if the user wants to receive email updates",
    })
    wantsEmailUpdates: boolean;

    @ApiProperty({
        type: [BlacklistedRegionDTO],
        description: "Locations to not be approached at",
    })
    blacklistedRegions: BlacklistedRegionDTO[];

    @ApiProperty({ type: "string", format: "date" })
    birthDay: Date;

    @ApiProperty({
        type: "string",
        format: "time",
        description: "The time from which the user can be approached",
    })
    approachFromTime: Date;

    @ApiProperty({
        type: "string",
        format: "time",
        description: "The time until which the user can be approached",
    })
    approachToTime: Date;

    @ApiProperty({ enum: EDateMode, description: "The date mode of the user" })
    dateMode: EDateMode;

    @ApiProperty({
        enum: EVerificationStatus,
        description: "The verification status of the user",
    })
    verificationStatus: EVerificationStatus;

    @ApiProperty({
        enum: EApproachChoice,
        description: "The approach choice of the user",
    })
    approachChoice: EApproachChoice;

    @ApiProperty({ enum: EGender, description: "The gender of the user" })
    gender: EGender;

    @ApiProperty({
        enum: EGenderDesire,
        description: "The gender the user is interested in",
    })
    genderDesire: EGenderDesire;

    @ApiProperty({
        description: "Has user recently requested account deletion?",
    })
    markedForDeletion: boolean;
}
