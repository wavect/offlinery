import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFiles,
    Body,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator, Put, Param, NotFoundException, Get,
} from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import {ApiConsumes, ApiBody, ApiTags, ApiOperation, ApiResponse, ApiParam} from '@nestjs/swagger';
import { User } from './user.entity';
import { CreateUserDTO } from '../DTOs/create-user.dto';
import {UserService} from "./user.service";
import {UpdateUserDTO} from "../DTOs/update-user.dto";
import {UserPublicDTO} from "../DTOs/user-public.dto";
import {CreateUserRequestDTO} from "../DTOs/create-user-request.dto";
import {UpdateUserRequestDTO} from "../DTOs/update-user-request.dto";
import {ParseJsonPipe} from "../pipes/ParseJson.pipe";

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
    @ApiBody({ type: CreateUserRequestDTO })
    @ApiOperation({ summary: 'Create a new user with images' })
    async createUser(
        @Body('user', new ParseJsonPipe()) createUserDto: CreateUserDTO,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024, message: 'Max file size of 100 MB exceeded' }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                ],
            })
        ) images: Express.Multer.File[]
    ): Promise<UserPublicDTO> {
        return (await this.userService.createUser(createUserDto, images)).convertToPublicDTO()
    }

    @Put(':id')
    @UseInterceptors(FilesInterceptor('images', 6))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UpdateUserRequestDTO })
    @ApiOperation({ summary: 'Update an existing user' })
    async updateUser(
        @Param('id') id: string,
        @Body('user', new ParseJsonPipe()) updateUserDto: UpdateUserDTO,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024, message: 'Max file size of 100 MB exceeded' }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
                ],
                fileIsRequired: false,
            })
        ) images?: Express.Multer.File[]
    ): Promise<UserPublicDTO> {
        return (await this.userService.updateUser(id, updateUserDto, images)).convertToPublicDTO();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'The user has been successfully retrieved.', type: User })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getUser(@Param('id') id: string): Promise<UserPublicDTO> {
        const user = await this.userService.getUserById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user.convertToPublicDTO();
    }
}