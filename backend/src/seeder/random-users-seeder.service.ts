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
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomBytes } from "crypto";
import * as path from "path";
import { Readable } from "stream";
import { Repository } from "typeorm";

@Injectable()
export class RandomUsersSeeder {
    constructor(
        private userService: UserService,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
    ) {}

    private AMOUNT_OF_USERS = 300;

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

    async seedRandomUsers(): Promise<void> {
        try {
            await this.userService.findUserByEmail("test@test.test");
            console.log("✓ Test Users exist");
            return;
        } catch (e) {
            console.log(`Seeding ${this.AMOUNT_OF_USERS} Test Users...`);
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
                    this.createRandomFile(),
                ]);
            } catch (e) {
                // any duplicates, fail silently
            }
        }

        console.log(`✓ Test Users Created`);
        console.log("- Updating Locations...");

        const users = await this.userService.findAll();
        const userCoordinates = this.generateUserCoordinates(users.length);

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
        const genderDesire =
            Math.random() < 0.5
                ? gender === EGender.MAN
                    ? EGender.WOMAN
                    : EGender.MAN
                : gender;
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
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.APPROACH,
            blacklistedRegions: [],
            approachFromTime,
            approachToTime,
            bio: "I'm a friendly person who loves outdoor activities and trying new cuisines.",
            dateMode,
            preferredLanguage: ELanguage.en,
        };
    }

    getRandomLatLong(centerLat, centerLong, radius, spread) {
        const radiusDegrees = radius / 111;
        const angle = Math.random() * 2 * Math.PI;
        const offsetLat =
            Math.random() * radiusDegrees * spread * Math.sin(angle);
        const offsetLong =
            Math.random() * radiusDegrees * spread * Math.cos(angle);
        const lat = centerLat + offsetLat;
        const long = centerLong + offsetLong;
        return {
            latitude: Number(lat.toFixed(6)),
            longitude: Number(long.toFixed(6)),
        };
    }

    generateUserCoordinates(count = 100) {
        const vienna = { lat: 48.210033, long: 16.363449 };
        const innsbruck = { lat: 47.2675, long: 11.391 };
        const coordinates = [];

        // Generate coordinates for Vienna (60% of users)
        for (let i = 0; i < count * 0.6; i++) {
            if (i < count * 0.4) {
                // 40% close to Vienna
                coordinates.push(
                    this.getRandomLatLong(vienna.lat, vienna.long, 10, 1),
                );
            } else {
                // 20% further from Vienna
                coordinates.push(
                    this.getRandomLatLong(vienna.lat, vienna.long, 30, 2),
                );
            }
        }
        // Generate coordinates for Innsbruck (40% of users)
        for (let i = 0; i < count * 0.4; i++) {
            if (i < count * 0.25) {
                // 25% close to Innsbruck
                coordinates.push(
                    this.getRandomLatLong(innsbruck.lat, innsbruck.long, 8, 1),
                );
            } else {
                // 15% further from Innsbruck
                coordinates.push(
                    this.getRandomLatLong(innsbruck.lat, innsbruck.long, 25, 2),
                );
            }
        }

        return coordinates;
    }
}
