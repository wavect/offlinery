import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationGhostReminderDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.GHOSTMODE_REMINDER;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.GHOSTMODE_REMINDER;
}
