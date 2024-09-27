import { CreateUserDTO } from "@/DTOs/create-user.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import {
    EApproachChoice,
    EDateMode,
    EEmailVerificationStatus,
    EEncounterStatus,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import { Point } from "geojson";
import * as path from "path";
import { Readable } from "stream";
import { Repository } from "typeorm";

@Injectable()
export class SpecificUsersEncountersSeeder {
    constructor(
        private userService: UserService,
        @InjectRepository(PendingUser)
        private pendingUserRepo: Repository<PendingUser>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) {}

    private specificUsers = [
        { name: "Anna", image: "anna.jpg", gender: EGender.WOMAN },
        { name: "Dana", image: "dana.jpg", gender: EGender.WOMAN },
        { name: "Jana", image: "jana.jpg", gender: EGender.WOMAN },
        { name: "John", image: "john.jpg", gender: EGender.MAN },
        { name: "Lisa", image: "lisa.jpg", gender: EGender.WOMAN },
        { name: "Lucas", image: "lucas.jpg", gender: EGender.MAN },
        { name: "Marco", image: "marco.jpg", gender: EGender.MAN },
        { name: "Thomas", image: "thomas.jpg", gender: EGender.MAN },
        { name: "Tim", image: "tim.jpg", gender: EGender.MAN },
        { name: "Tina", image: "tina.png", gender: EGender.WOMAN },
    ];

    createFileFromImage(imageName: string): Express.Multer.File {
        const imagePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "test",
            "_src",
            "images",
            imageName,
        );

        const buffer = fs.readFileSync(imagePath);
        const stats = fs.statSync(imagePath);

        const fileStream = new Readable();
        fileStream.push(buffer);
        fileStream.push(null);

        const file: Express.Multer.File = {
            fieldname: "file",
            originalname: imageName,
            encoding: "7bit",
            mimetype: "image/png",
            buffer,
            size: stats.size,
            destination: "uploads/",
            filename: imageName,
            path: path.join("uploads", imageName),
            stream: fileStream,
        };

        return file;
    }

    async seed(): Promise<void> {
        let wavectUser: User;
        try {
            wavectUser =
                await this.userService.findUserByEmailOrFail(
                    "office@wavect.io",
                );
            console.log("✓ Wavect user found");
        } catch (e) {
            console.error(
                "Wavect user not found. Please ensure it exists before running this seeder.",
            );
            return;
        }

        const existingUsers = await this.userRepo.find();
        if (existingUsers.length > 1) {
            console.log("✓ Specific Users and Encounters already exist");
            return;
        }

        console.log("Seeding Specific Users and Encounters...");

        const createdUsers = await this.createSpecificUsers();
        await this.createEncountersForUser(wavectUser, createdUsers);

        console.log("✓ Specific Users and Encounters Created");
    }

    private async createSpecificUsers(): Promise<User[]> {
        const createdUsers: User[] = [];

        for (const user of this.specificUsers) {
            const userDto: CreateUserDTO = {
                firstName: user.name,
                email: `${user.name.toLowerCase()}@example.com`,
                clearPassword: "securePassword123!",
                wantsEmailUpdates: true,
                birthDay: new Date("1990-01-01"),
                gender: user.gender,
                genderDesire:
                    user.gender === EGender.MAN ? EGender.WOMAN : EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                blacklistedRegions: [],
                approachFromTime: new Date(),
                approachToTime: new Date(),
                bio: `I'm ${user.name}, nice to meet you!`,
                dateMode: EDateMode.LIVE,
                preferredLanguage: ELanguage.en,
            };

            await this.createVerifiedUser(userDto, [
                this.createFileFromImage(user.image),
            ]);
            const createdUser = await this.userRepo.findOneByOrFail({
                email: userDto.email,
            });
            createdUsers.push(createdUser);
        }

        return createdUsers;
    }

    private async createVerifiedUser(
        user: CreateUserDTO,
        images: Express.Multer.File[] = [],
    ): Promise<void> {
        const pendingUser = new PendingUser();
        pendingUser.email = user.email;
        pendingUser.verificationCode = "1";
        pendingUser.verificationCodeIssuedAt = new Date();
        pendingUser.verificationStatus = EEmailVerificationStatus.VERIFIED;
        await this.pendingUserRepo.save(pendingUser);

        await this.userService.createUser(user, images);
        await this.userRepo.update(
            { email: user.email },
            { verificationStatus: EVerificationStatus.VERIFIED },
        );
    }

    private async createEncountersForUser(
        wavectUser: User,
        otherUsers: User[],
    ): Promise<void> {
        for (const otherUser of otherUsers) {
            await this.createEncounter(wavectUser, otherUser);
        }
    }

    private async createEncounter(
        wavectUser: User,
        user2: User,
    ): Promise<void> {
        const encounter = new Encounter();
        encounter.users = [wavectUser, user2];
        encounter.isNearbyRightNow = Math.random() < 0.2; // 20% chance of being nearby
        encounter.lastDateTimePassedBy = this.getRandomPastDate();
        encounter.lastLocationPassedBy = this.getRandomPoint();
        encounter.userStatuses = {
            [wavectUser.id]: EEncounterStatus.MET_INTERESTED,
            [user2.id]: EEncounterStatus.MET_INTERESTED,
        };

        await this.encounterRepository.save(encounter);

        if (!user2.encounters?.length) {
            user2.encounters = [];
        }
        if (!wavectUser.encounters?.length) {
            wavectUser.encounters = [];
        }

        wavectUser.encounters.push(encounter);
        await this.userRepo.save(wavectUser);

        user2.encounters.push(encounter);
        await this.userRepo.save(user2);
    }

    private getRandomPastDate(): Date {
        const now = new Date();
        return new Date(
            now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        );
    }

    private getRandomPoint(): Point {
        return {
            type: "Point",
            coordinates: [
                16.363449 + (Math.random() - 0.5) * 0.1, // Longitude (Vienna-centric)
                48.210033 + (Math.random() - 0.5) * 0.1, // Latitude (Vienna-centric)
            ],
        };
    }
}
