import {ApiProperty} from '@nestjs/swagger';
import {CreateUserDTO} from "./create-user.dto";

export class CreateUserRequestDTO {
    @ApiProperty({ type: CreateUserDTO })
    user: CreateUserDTO;

    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    images: Express.Multer.File[];
}