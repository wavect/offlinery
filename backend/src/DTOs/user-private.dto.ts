import { ApiProperty } from '@nestjs/swagger';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import {BlacklistedRegionDTO} from "./blacklisted-region.dto";
import {UserPublicDTO} from "./user-public.dto";

/** @dev Supposed to be only viewable by actual user him/herself. */
export class UserPrivateDTO extends UserPublicDTO{
    @ApiProperty({ description: 'The unique email of the user' })
    email: string;

    @ApiProperty({ description: 'Indicates if the user wants to receive email updates' })
    wantsEmailUpdates: boolean;

    @ApiProperty({type: [BlacklistedRegionDTO], description: 'Locations to not be approached at'})
    blacklistedRegions: BlacklistedRegionDTO[];
}