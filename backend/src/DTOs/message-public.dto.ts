import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class MessagePublicDTO {
    @ApiProperty({ description: "Message id." })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: "Message sent by user." })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: "Who sent the message?" })
    @IsString()
    @IsNotEmpty()
    senderUserId: string;

    @ApiProperty({
        type: "string",
        format: "datetime",
        description: "The date time the message was sent.",
    })
    sentAt: Date;
}
