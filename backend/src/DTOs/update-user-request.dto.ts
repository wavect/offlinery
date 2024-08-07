import {ApiProperty} from '@nestjs/swagger';
import {UpdateUserDTO} from "./update-user.dto";

export class UpdateUserRequestDTO {
    @ApiProperty({ type: UpdateUserDTO, required: false })
    user: UpdateUserDTO;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
            format: 'binary'
        },
        description: 'An array of image files',
        maxItems: 6,
        required: false,
    })
    images: Blob[];
}