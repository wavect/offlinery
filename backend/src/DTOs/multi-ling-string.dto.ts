import { ELanguage } from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";

export class MultiLingStringDTO {
    @ApiProperty({
        nullable: false,
        required: true,
        description:
            "Multi-lingual string object with translations for different languages",
        example: {
            [ELanguage.en]: "English text",
            [ELanguage.de]: "Deutscher text",
        },
    })
    translations: { [key in ELanguage]: string };
}
