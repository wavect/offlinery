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
import process from "process";
import { Readable } from "stream";
import { Like, Repository } from "typeorm";

@Injectable()
export class Create10RealTestPeopleEncounters {
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
        { name: "Tina", image: "tina.jpg", gender: EGender.WOMAN },
    ];

    createFileFromImage(imageName: string, index: number): Express.Multer.File {
        const imagePath = path.join(
            process.cwd(),
            "src",
            "seeder",
            "images",
            imageName,
        );
        try {
            const buffer = fs.readFileSync(imagePath);
            const stats = fs.statSync(imagePath);
            const fileStream = new Readable();
            fileStream.push(buffer);
            fileStream.push(null);

            const file: Express.Multer.File = {
                fieldname: "file",
                originalname: index.toString(),
                encoding: "7bit",
                mimetype: `image/${path.extname(imageName).slice(1)}`,
                buffer,
                size: stats.size,
                destination: "uploads/",
                filename: imageName,
                path: path.join("uploads", imageName),
                stream: fileStream,
            };

            return file;
        } catch (error) {
            console.error("Error creating file from image:", error);
            throw error;
        }
    }
    async seed(): Promise<void> {
        let wavectUser: User;
        let testUserAnna: User;
        try {
            wavectUser =
                await this.userService.findUserByEmailOrFail(
                    "office@wavect.io",
                );
            console.log("✓ 10 Real Users Seeder -> W exists");
        } catch (e) {
            console.error("- Wavect user not found or duplicate err");
            return;
        }

        try {
            /** @DEV if anna is seeded, the others are too */
            testUserAnna = await this.userService.findUserByEmailOrFail(
                "anna@pre-encounter-item.com",
            );
        } catch (e) {
            console.log("✓ 10 Real Users Seeder -> TestUser Anna exists");

            if (testUserAnna) {
                console.log("✓ Already seeded real user encounters");
                return;
            } else {
                console.log("- Real test users not found, seeding...");
            }

            console.log("- Encounters missing, seeding...");
            const createdUsers = await this.createSpecificUsers();
            console.log("Users created!");
            await this.createEncountersForUser(wavectUser, createdUsers);
            console.log("Encounters created!");

            console.log("✓ Specific Users and Encounters Created");
        }
    }

    private async createSpecificUsers(): Promise<User[]> {
        const createdUsers: User[] = [];

        for (let i = 0; i < this.specificUsers.length; i++) {
            const user = this.specificUsers[i];
            function generateRandomBirthday(
                minAge: number,
                maxAge: number,
            ): Date {
                const today = new Date();
                const minDate = new Date(
                    today.getFullYear() - maxAge,
                    today.getMonth(),
                    today.getDate(),
                );
                const maxDate = new Date(
                    today.getFullYear() - minAge,
                    today.getMonth(),
                    today.getDate(),
                );
                const randomTimestamp =
                    minDate.getTime() +
                    Math.random() * (maxDate.getTime() - minDate.getTime());
                return new Date(randomTimestamp);
            }
            const userDto: CreateUserDTO = {
                firstName: user.name,
                email: `${user.name.toLowerCase()}@pre-encounter-item.com`,
                clearPassword: "securePassword123!",
                wantsEmailUpdates: true,
                birthDay: generateRandomBirthday(25, 30),
                gender: user.gender,
                genderDesire:
                    user.gender === EGender.MAN ? EGender.WOMAN : EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                blacklistedRegions: [],
                approachFromTime: new Date("2023-01-01 08:00:00"),
                approachToTime: new Date("2023-01-01 20:00:00"),
                bio: `I'm ${user.name}, nice to meet you!`,
                dateMode: EDateMode.LIVE,
                preferredLanguage: ELanguage.en,
            };

            await this.createVerifiedUser(userDto, [
                this.createFileFromImage(user.image, i + 1),
            ]);

            const createdUser = await this.userRepo.findOneByOrFail({
                email: userDto.email,
            });
            createdUsers.push(createdUser);
        }

        // Update approachChoice for all users with @pre-encounter-item.com email
        await this.updateApproachChoiceForPreEncounterUsers();

        return createdUsers;
    }

    private async updateApproachChoiceForPreEncounterUsers(): Promise<void> {
        const preEncounterUsers = await this.userRepo.find({
            where: {
                email: Like("%@pre-encounter-item.com"),
            },
        });

        console.log("Updating approach choice...");
        for (const user of preEncounterUsers) {
            user.approachChoice = EApproachChoice.BE_APPROACHED;
            await this.userRepo.save(user);
        }
        console.log("Updated!");

        const preEncounterUsersAfter = await this.userRepo.find({
            where: {
                email: Like("%@pre-encounter-item.com"),
            },
        });

        console.log(preEncounterUsersAfter.map((b) => b));
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
        encounter.isNearbyRightNow = Math.random() < 0.8; // 80% chance of being nearby
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
