import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { LocationUpdateDTO } from "@/DTOs/location-update.dto";
import { UpdateUserDTO } from "@/DTOs/update-user.dto";
import { PendingUser } from "@/registration/pending-user/pending-user.entity";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { EApproachChoice, EEmailVerificationStatus } from "@/types/user.types";
import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Expo } from "expo-server-sdk";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user.entity";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @Inject(forwardRef(() => MatchingService))
        private matchingService: MatchingService,
    ) {}

    private async saveFiles(
        files: Express.Multer.File[],
    ): Promise<{ index: number; filePath: string }[]> {
        const uploadDir = "uploads/img";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const savedFilePaths = await Promise.all(
            files.map(async (file) => {
                const index = Number(file.originalname);

                if (isNaN(index)) {
                    throw new Error(
                        `Could not parse image index to number. Tried to parse following value: ${file.originalname}`,
                    );
                }

                // mimeType examples: "image/jpeg", "image/png".
                // Since we only allow image files, we can assume mimeType always follows this scheme.
                const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}.${file.mimetype.split("/")[1]}`;
                const filePath = path.join(uploadDir, uniqueFilename);
                await fs.promises.writeFile(filePath, file.buffer);
                return { index, filePath: uniqueFilename };
            }),
        );

        return savedFilePaths.sort((a, b) => a.index - b.index);
    }

    async createUser(
        createUserDto: CreateUserDTO,
        images: Express.Multer.File[],
    ): Promise<User> {
        const user = new User();
        Object.assign(user, createUserDto);

        // Double check if user's email actually is verified.
        await this.pendingUserRepo.findOneByOrFail({
            email: user.email,
            verificationStatus: EEmailVerificationStatus.VERIFIED,
        });

        // @dev https://docs.nestjs.com/security/encryption-and-hashing
        user.passwordSalt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(
            createUserDto.clearPassword,
            user.passwordSalt,
        );

        // Save images
        user.imageURIs = (await this.saveFiles(images)).map(
            (image) => image.filePath,
        );

        // Save blacklisted regions
        if (createUserDto.blacklistedRegions) {
            user.blacklistedRegions = await Promise.all(
                createUserDto.blacklistedRegions.map(async (region) => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.location = region.location;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(
                        blacklistedRegion,
                    );
                }),
            );
        }
        return await this.userRepository.save(user);
    }

    // TODO: Only to be updated by that specific user!
    async updateUser(
        id: string,
        updateUserDto: UpdateUserDTO,
        images?: Express.Multer.File[],
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new Error("User not found");
        }

        // Update user properties
        Object.assign(user, updateUserDto);

        // Update images if provided
        if (images && images.length > 0) {
            const newImages = await this.saveFiles(images);
            for (let index = 0; index < newImages.length; index++) {
                const image = newImages[index];
                user.imageURIs[image.index] = image.filePath;
            }
        }

        // Update blacklisted regions if provided
        if (updateUserDto.blacklistedRegions) {
            // Remove old blacklisted regions
            if (user.blacklistedRegions) {
                console.log("blacklisted: ", user.blacklistedRegions);
                const blacklistedRegions =
                    await this.blacklistedRegionRepository.findBy(
                        user.blacklistedRegions.map((region) => ({
                            id: region.id,
                        })),
                    );
                await this.blacklistedRegionRepository.remove(
                    blacklistedRegions,
                );
            }

            // Add new blacklisted regions
            user.blacklistedRegions = await Promise.all(
                updateUserDto.blacklistedRegions.map(async (region) => {
                    const blacklistedRegion = new BlacklistedRegion();
                    blacklistedRegion.location = region.location;
                    blacklistedRegion.radius = region.radius;
                    return await this.blacklistedRegionRepository.save(
                        blacklistedRegion,
                    );
                }),
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

    async findUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["blacklistedRegions"], // Include related entities if needed
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ["blacklistedRegions"], // Include related entities if needed
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }

    async updatePushToken(userId: string, pushToken: string): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!Expo.isExpoPushToken(pushToken)) {
            this.logger.error(
                `Push token ${pushToken} is not a valid Expo push token`,
            );
            throw new Error(`Expo push token is invalid: ${pushToken}`);
        }

        user.pushToken = pushToken;
        return await this.userRepository.save(user);
    }

    // TODO: Only to be updated by that specific user!
    async updateLocation(
        userId: string,
        { latitude, longitude }: LocationUpdateDTO,
    ): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.location = { type: "Point", coordinates: [longitude, latitude] };
        const updatedUser = await this.userRepository.save(user);

        // Check for matches and send notifications (from a semantic perspective we only send notifications if a person to be approached sends a location update)
        if (
            user.approachChoice in
            [EApproachChoice.BOTH, EApproachChoice.BE_APPROACHED]
        ) {
            this.logger.debug(
                `Sending notifications to users that want to potentially approach userId ${user.id}`,
            );
            await this.matchingService.checkAndNotifyMatches(user);
        }

        return updatedUser;
    }
}
