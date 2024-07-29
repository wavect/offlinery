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

@ApiTags('User')
@Controller({
    version: '1',
    path: 'user',
})
export class UserController {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>
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
        const user = new User();
        Object.assign(user, createUserDto);

        // Save images
        user.images = images.map(image => ({
            filename: image.filename,
            mimetype: image.mimetype,
            path: image.path
        }));

        // Save blacklisted regions
        if (createUserDto.blacklistedRegions) {
            user.blacklistedRegions = await Promise.all(
                createUserDto.blacklistedRegions.map(async region => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.center = region.center;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(blacklistedRegion);
                })
            );
        }

        return await this.userRepository.save(user);
    }
}