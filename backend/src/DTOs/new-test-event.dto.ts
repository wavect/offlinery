import { ApiProperty } from "@nestjs/swagger";

export class NewTestEventDTO {
    @ApiProperty({
        nullable: true,
        required: false,
    })
    pushTokens: string[];
}
