import { ApiProperty } from "@nestjs/swagger";

export class UserNotificationSettingsDTO {
    @ApiProperty({
        nullable: false,
        description: "Notification Setting",
    })
    notificationSettingKey: string;

    @ApiProperty({
        nullable: true,
        description: "User facing label",
    })
    notificationSettingLbl: string;

    @ApiProperty({
        nullable: false,
        description: "Notification Setting",
    })
    notificationSettingValue: boolean;
}
