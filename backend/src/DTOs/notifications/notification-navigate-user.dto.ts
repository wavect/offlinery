import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";
import { UserPublicDTO } from "../user-public.dto";

export class NotificationNavigateUserDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.NEW_MATCH;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.NAVIGATE_TO_APPROACH;

    @ApiProperty({ type: UserPublicDTO })
    navigateToPerson: UserPublicDTO;

    @ApiProperty()
    encounterId: string;
}
