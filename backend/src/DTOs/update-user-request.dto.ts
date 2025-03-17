import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserDTO } from "./update-user.dto";

export class UpdateUserRequestDTO {
    @ApiProperty({ type: UpdateUserDTO, format: "json", required: false })
    updateUserDTO?: UpdateUserDTO;

    // @dev Some indices may be undefined as we don't necessarily want to override images (retain indices)
    @ApiProperty({
        type: "array",
        items: {
            type: "string",
            format: "binary",
        },
        description: "An array of image files",
        maxItems: 6,
        required: false,
    })
    images?: (Blob | undefined)[];
}
