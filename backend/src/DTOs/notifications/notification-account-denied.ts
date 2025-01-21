import {
    BaseNotificationADTO,
    ENotificationType,
} from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationAccountDeniedDTO extends BaseNotificationADTO {
    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType = ENotificationType.ACCOUNT_DENIED;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.ACCOUNT_DENIED;
}
