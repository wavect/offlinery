import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class StorePushTokenDTO {
    @ApiProperty({
        description: "The Expo push token for the user's device",
        example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    })
    @IsString()
    @IsNotEmpty()
    pushToken: string;
}
