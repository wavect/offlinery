import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationDidYouMeetDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.DID_YOU_MEET;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.DID_YOU_MEET;

    @ApiProperty()
    encounterId: string;
}
