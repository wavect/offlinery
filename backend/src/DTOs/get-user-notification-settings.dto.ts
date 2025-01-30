import { ApiProperty } from "@nestjs/swagger";

export class UserNotificationSettingsDTO {
    @ApiProperty({
        nullable: false,
        description: "Notification Setting",
    })
    notficationSettingKey: string;

    @ApiProperty({
        nullable: false,
        description: "Notification Setting",
    })
    notificationSettingValue: boolean;
}
