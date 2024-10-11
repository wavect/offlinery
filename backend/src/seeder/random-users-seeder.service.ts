import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { generateUserCoordinates } from "@/seeder/seeder.utils";
import {
    EApproachChoice,
    EDateMode,
    EEmailVerificationStatus,
    EGender,
    EGenderDesire,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import * as path from "path";
import process from "process";
import { Readable } from "stream";
import { Repository } from "typeorm";

@Injectable()
export class RandomUsersSeeder {
    constructor(
        private userService: UserService,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    private AMOUNT_OF_USERS = 300;

    createFileFromImage(index: number = 0): Express.Multer.File {
        const actualFilename = "img.png";

        const imagePath = path.join(
            process.cwd(),
            "src",
            "seeder",
            "images",
            actualFilename,
        );
        const buffer = fs.readFileSync(imagePath);
        const stats = fs.statSync(imagePath);

        const fileStream = new Readable();
        fileStream.push(buffer);
        fileStream.push(null);

        return {
            fieldname: "file",
            originalname: index.toString(),
            encoding: "7bit",
            mimetype: "image/png",
            buffer,
            size: stats.size,
            destination: "uploads/",
            filename: actualFilename,
            path: path.join("uploads", actualFilename),
            stream: fileStream,
        };
    }

    async seedRandomUsers(): Promise<void> {
        try {
            await this.userService.findUserByEmailOrFail("test@test.test");
            console.log("✓ 300 random naive test users exist - Skipping");
            return;
        } catch (e) {
            console.log(`SEED RUN -> [${this.AMOUNT_OF_USERS} Test Users]...`);
        }

        for (let i = 0; i < this.AMOUNT_OF_USERS; i++) {
            const user: CreateUserDTO = this.generateRandomUser(i);

            const email = user.email;

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

            try {
                await this.userService.createUser(user, [
                    this.createFileFromImage(),
                ]);
                await this.userRepo.update(
                    { email },
                    { verificationStatus: EVerificationStatus.VERIFIED },
                );
            } catch (e) {
                console.log("SEED Error", e);
            }
        }

        console.log(`✓ SEED RUN DONE`);
        console.log(`- Updating Locations of seeded users`);

        const users = await this.userService.findAll();
        const userCoordinates = generateUserCoordinates(users.length);
        for (const [index, user] of users.entries()) {
            await this.userService.updateLocation(
                user.id,
                userCoordinates[index],
            );
        }

        console.log("✓ Test Users Locations updated");
    }

    private generateRandomUser(index: number): CreateUserDTO {
        const gender = Math.random() < 0.5 ? EGender.MAN : EGender.WOMAN;
        const genderMapped = this.mapGenderToGenderDesire(gender);
        const genderDesire =
            Math.random() < 0.5
                ? genderMapped === EGenderDesire.MAN
                    ? EGenderDesire.WOMAN
                    : EGenderDesire.MAN
                : genderMapped;
        const dateMode =
            Math.random() < 0.95 ? EDateMode.LIVE : EDateMode.GHOST;

        const approachFromTime = new Date();
        approachFromTime.setHours(Math.floor(Math.random() * 24));
        approachFromTime.setMinutes(0);

        const approachToTime = new Date(approachFromTime.getTime());
        approachToTime.setHours(
            approachToTime.getHours() + 10 + Math.floor(Math.random() * 14),
        ); // 10-24 hour range

        return {
            firstName: gender === EGender.MAN ? "John" : "Jane",
            email:
                index === 0
                    ? "test@test.test"
                    : `test-user@test${Math.floor(Math.random() * 999999999)}@gmail.com`,
            clearPassword: "securePassword123!",
            wantsEmailUpdates: true,
            birthDay: new Date("1990-01-01"),
            gender,
            genderDesire,
            approachChoice: EApproachChoice.APPROACH,
            blacklistedRegions: [],
            approachFromTime,
            approachToTime,
            bio: "I'm a friendly person who loves outdoor activities and trying new cuisines.",
            dateMode,
            preferredLanguage: ELanguage.en,
        };
    }

    private mapGenderToGenderDesire(gender: EGender): EGenderDesire {
        return gender === EGender.MAN ? EGenderDesire.MAN : EGenderDesire.WOMAN;
    }
}
