import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationSafetyCallMissedDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.SAFETY_CALL_MISSED;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.SAFETY_CALL_MISSED;
}
