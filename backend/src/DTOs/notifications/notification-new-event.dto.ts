import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { ApiProperty } from "@nestjs/swagger";

export class NotificationNewEventDTO {
    @ApiProperty({ enum: EAppScreens })
    screen: EAppScreens.NEW_EVENT;

    // TODO: We might need to add eventId/Data here once we actually persist those, etc.
}
