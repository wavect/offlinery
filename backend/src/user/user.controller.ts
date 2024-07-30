import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    Body,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from '../DTOs/create-user.dto';
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';
import {UserService} from "./user.service";

@ApiTags('User')
@Controller({
    version: '1',
    path: 'user',
})
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Post('create')
    @UseInterceptors(FilesInterceptor('images', 6))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                user: { type: 'object' },
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiOperation({ summary: 'Create a new user with images' })
    async createUser(
        @Body() createUserDto: CreateUserDto,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024, message: 'Max file size of 100 MB exceeded' }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                ],
            })
        ) images: Express.Multer.File[]
    ) {
        return this.userService.createUser(createUserDto, images)
    }
}