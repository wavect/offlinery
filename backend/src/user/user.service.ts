import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { BlacklistedRegion } from 'src/blacklisted-region/blacklisted-region.entity';
import {CreateUserDto} from "../DTOs/create-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>
    ) {}

    async createUser(createUserDto: CreateUserDto, images: Express.Multer.File[]): Promise<User> {
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

    findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    findOne(id: number): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
}