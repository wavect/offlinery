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
import { Repository } from "typeorm";

@Injectable()
export class RandomUserLocationsSeeder {
    constructor(
        private userService: UserService,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
    ) {}

    private AMOUNT_OF_USERS = 300;

    async seedRandomUserLocations(): Promise<void> {
        try {
            await this.userService.findUserByEmail("test@test.test");
            console.log(`✓ No Test User Seed. Already seeded.`);
            return;
        } catch (e) {
            console.log(`Seeding ${this.AMOUNT_OF_USERS} Test Users...`);
        }

        for (let i = 0; i < this.AMOUNT_OF_USERS; i++) {
            const user: CreateUserDTO = {
                firstName: "John",
                email: "test@test.test",
                clearPassword: "securePassword123!",
                wantsEmailUpdates: true,
                birthDay: new Date("1990-01-01"),
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
                verificationStatus: EVerificationStatus.VERIFIED,
                approachChoice: EApproachChoice.APPROACH,
                blacklistedRegions: [],
                approachFromTime: new Date("2024-09-06T09:00:00Z"),
                approachToTime: new Date("2024-09-06T17:00:00Z"),
                bio: "I'm a friendly person who loves outdoor activities and trying new cuisines.",
                dateMode: EDateMode.LIVE,
                preferredLanguage: ELanguage.en,
            };
            if (i !== 0) {
                user.email = `test-user@test${Math.floor(Math.random() * 999999999)}@gmail.com`;
            }

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
                await this.userService.createUser(user, []);
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

    getRandomLatLong(centerLat, centerLong, radius, spread) {
        // Convert radius from km to degrees (roughly)
        const radiusDegrees = radius / 111;

        // Generate a random angle
        const angle = Math.random() * 2 * Math.PI;

        // Calculate the offset
        const offsetLat =
            Math.random() * radiusDegrees * spread * Math.sin(angle);
        const offsetLong =
            Math.random() * radiusDegrees * spread * Math.cos(angle);

        // Add offset to center coordinates
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
