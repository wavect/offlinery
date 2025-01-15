import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationSafetyCallReminderDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.SAFETYCALL_REMINDER;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.SAFETYCALL_REMINDER;
}
