import {ApiProperty} from '@nestjs/swagger';
import {UpdateUserDTO} from "./update-user.dto";

export class UpdateUserRequestDTO {
    @ApiProperty({ type: UpdateUserDTO })
    user: UpdateUserDTO;

    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    images: Express.Multer.File[];
}