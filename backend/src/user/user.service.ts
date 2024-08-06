import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';
import {CreateUserDTO} from "../DTOs/create-user.dto";
import {UpdateUserDTO} from "../DTOs/update-user.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>
    ) {}

    async createUser(createUserDto: CreateUserDTO, images: Express.Multer.File[]): Promise<User> {
        const user = new User();

        // @dev https://docs.nestjs.com/security/encryption-and-hashing
        user.passwordSalt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(createUserDto.clearPassword, user.passwordSalt);

        // Save images
        user.images = images

        // Save blacklisted regions
        if (createUserDto.blacklistedRegions) {
            user.blacklistedRegions = await Promise.all(
                createUserDto.blacklistedRegions.map(async region => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.latitude = region.latitude;
                    blacklistedRegion.longitude = region.longitude;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(blacklistedRegion);
                })
            );
        }

        Object.assign(user, createUserDto);

        return await this.userRepository.save(user);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDTO, images?: Express.Multer.File[]): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new Error('User not found');
        }

        // Update user properties
        Object.assign(user, updateUserDto);

        // Update images if provided
        if (images && images.length > 0) {
            user.images = images;
        }

        // Update blacklisted regions if provided
        if (updateUserDto.blacklistedRegions) {
            // Remove old blacklisted regions
            if (user.blacklistedRegions) {
                await this.blacklistedRegionRepository.remove(user.blacklistedRegions);
            }

            // Add new blacklisted regions
            user.blacklistedRegions = await Promise.all(
                updateUserDto.blacklistedRegions.map(async region => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.latitude = region.latitude;
                    blacklistedRegion.longitude = region.longitude;
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

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['blacklistedRegions'] // Include related entities if needed
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async updatePushToken(userId: number, pushToken: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.pushToken = pushToken;
        return await this.userRepository.save(user);
    }
}