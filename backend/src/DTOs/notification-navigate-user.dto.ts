import { ApiProperty } from "@nestjs/swagger";
import { UserPublicDTO } from "./user-public.dto";

/** @dev To ensure screens are properly typed on frontend. The Enum Values should be the same as in the routes on mobile! */
export enum EAppScreens {
    NAVIGATE_TO_APPROACH = "Main_NavigateToApproach",
}

export class NotificationNavigateUserDTO {
    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens;

    @ApiProperty({ type: UserPublicDTO })
    navigateToPerson: UserPublicDTO;

    @ApiProperty()
    encounterId: string;
}
