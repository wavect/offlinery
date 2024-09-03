import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserService } from "@/entities/user/user.service";
import {
    EApproachChoice,
    EDateMode,
    EEmailVerificationStatus,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "crypto";
import * as path from "node:path";
import { Readable } from "stream";
import { Repository } from "typeorm";

@Injectable()
export class UserSeeder {
    private readonly logger = new Logger(UserSeeder.name);

    constructor(
        private userService: UserService,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
    ) {}

    createRandomFile() {
        // Generate a random filename
        const filename = `1`;
        const buffer = randomBytes(1024 * 1024);
        const fileStream = new Readable();
        fileStream.push(buffer);
        fileStream.push(null);

        // Create the file object
        const file: Express.Multer.File = {
            fieldname: "file",
            originalname: filename,
            encoding: "7bit",
            mimetype: "image/jpeg",
            buffer, // 1 MB of random data
            size: 1024 * 1024, // 1 MB
            destination: "uploads/",
            filename: filename,
            path: path.join("uploads", filename),
            stream: fileStream,
        };

        return file;
    }

    async seedDefaultUser(): Promise<void> {
        const email = "office@wavect.io";
        try {
            await this.userService.findUserByEmail(email); // fails if user does not exist
        } catch (err) {
            const defaultUser: CreateUserDTO = {
                firstName: "TestUser",
                wantsEmailUpdates: false,
                preferredLanguage: ELanguage.en,
                email,
                clearPassword: "TeSTmE93!pQ",
                birthDay: new Date("1990-01-01"),
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
                verificationStatus: EVerificationStatus.VERIFIED,
                approachChoice: EApproachChoice.APPROACH,
                approachFromTime: new Date("2023-01-01 08:00:00"),
                approachToTime: new Date("2023-01-01 20:00:00"),
                dateMode: EDateMode.GHOST,
                bio: "This is a default test user for the application.",
                blacklistedRegions: [],
            };

            const pendingUser = await this.pendingUserRepo.findOneBy({ email });
            if (pendingUser) {
                pendingUser.verificationStatus =
                    EEmailVerificationStatus.VERIFIED;
                await this.pendingUserRepo.update({ email }, pendingUser);
            } else {
                const pendingUser = new PendingUser();
                pendingUser.email = email;
                pendingUser.verificationCode = "1";
                pendingUser.verificationCodeIssuedAt = new Date();
                pendingUser.verificationStatus =
                    EEmailVerificationStatus.VERIFIED;
                await this.pendingUserRepo.save(pendingUser);
            }
            this.logger.debug(`Registered pending default user.`);

            await this.userService.createUser(defaultUser, [
                this.createRandomFile(),
            ]);
            this.logger.debug(`Seeded default user.`);
        }
    }
}
