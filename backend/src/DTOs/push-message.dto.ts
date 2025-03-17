import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class PushMessageDTO {
    @ApiProperty({ description: "Message content" })
    @IsString()
    content: string;

    @ApiProperty({ description: "Encounter ID" })
    @IsUUID()
    encounterId: string;
}
