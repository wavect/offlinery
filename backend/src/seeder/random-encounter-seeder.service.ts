import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { EEncounterStatus } from "@/types/user.types";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Point } from "geojson";
import { Repository } from "typeorm";

@Injectable()
export class RandomEncounterSeeder {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) {}

    private ENCOUNTERS = 10;
    private RANDOM_USERS_COUNT = 15;

    async seedRandomEncounters(): Promise<void> {
        const encounters = await this.encounterRepository.find();
        if (encounters.length) {
            console.log("✓ Encounters exist");
            return;
        }

        const wavectUser = await this.userRepository.findOne({
            where: { email: "office@wavect.io" },
        });
        if (!wavectUser) {
            console.log("Test user not found");
            return;
        }

        const allUsers = await this.userRepository.find();
        const otherUsers = allUsers.filter((u) => u.id !== wavectUser.id);
        const randomUsers = this.getRandomUsers(
            otherUsers,
            this.RANDOM_USERS_COUNT,
        );

        await this.createEncountersForUser(wavectUser, randomUsers);

        console.log("✓ Encounters seeded successfully");
    }

    private getRandomUsers(users: User[], count: number): User[] {
        const shuffled = users.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    private async createEncountersForUser(
        wavectUser: User,
        otherUsers: User[],
    ): Promise<void> {
        for (let i = 0; i < this.ENCOUNTERS; i++) {
            const otherUser = this.getRandomUser(otherUsers);
            await this.createEncounter(wavectUser, otherUser);
        }
    }

    private getRandomUser(users: User[]): User {
        const randomIndex = Math.floor(Math.random() * users.length);
        return users[randomIndex];
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
            [wavectUser.id]: this.getRandomStatus(),
            [user2.id]: this.getRandomStatus(),
        };
        await this.encounterRepository.save(encounter);

        if (!user2.encounters?.length) {
            user2.encounters = [];
        }

        if (!wavectUser.encounters?.length) {
            wavectUser.encounters = [];
        }

        wavectUser.encounters.push(encounter);
        await this.userRepository.save(wavectUser);

        user2.encounters.push(encounter);
        await this.userRepository.save(user2);
    }

    private getRandomPastDate(): Date {
        const now = new Date();
        const pastDate = new Date(
            now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ); // Random date within the last 30 days
        return pastDate;
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

    private getRandomStatus(): EEncounterStatus {
        const statuses = [
            EEncounterStatus.NOT_MET,
            EEncounterStatus.MET_INTERESTED,
            EEncounterStatus.MET_NOT_INTERESTED,
        ];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }
}
