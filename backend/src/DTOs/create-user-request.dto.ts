import {ApiProperty} from '@nestjs/swagger';
import {CreateUserDTO} from "./create-user.dto";

export class CreateUserRequestDTO {
    @ApiProperty({ type: CreateUserDTO })
    user: CreateUserDTO;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'file',
            format: 'binary'
        },
        description: 'An array of image files',
        maxItems: 6 // Assuming a maximum of 6 images as per your controller
    })
    images: Express.Multer.File[];
}