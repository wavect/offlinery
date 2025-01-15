import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export enum ENotificationType {
    NEW_MATCH = "new_match",
    NEW_EVENT = "new_event",
    ACCOUNT_APPROVED = "account_approved",
    GHOSTMODE_REMINDER = "ghostmode_reminder",
    SAFETYCALL_REMINDER = "safetycall_reminder",
}

export abstract class BaseNotificationADTO implements Record<string, unknown> {
    [key: string]: unknown;

    @ApiProperty({ enum: ENotificationType })
    type: ENotificationType;

    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens;
}
