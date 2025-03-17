import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationNewMessageDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.NEW_MESSAGE;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.NEW_MESSAGE;
}
