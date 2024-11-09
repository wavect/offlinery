import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationNewEventDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.NEW_EVENT;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.NEW_EVENT;

    // TODO: We might need to add eventId/Data here once we actually persist those, etc.
}
