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
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) {}

    private ENCOUNTERS_PER_USER = 5;

    async seedRandomEncounters(): Promise<void> {
        const encounters = await this.encounterRepository.find();
        if (encounters.length) {
            console.log("✓ Encounters exist");
            return;
        }
        const users = await this.userRepository.find();

        console.log(`Seeding encounters for ${users.length} users...`);

        for (const [index, user] of users.entries()) {
            if (index > 15) return;
            await this.createEncountersForUser(user, users);
        }

        console.log("✓ Encounters seeded successfully");
    }

    private async createEncountersForUser(
        user: User,
        allUsers: User[],
    ): Promise<void> {
        const otherUsers = allUsers.filter((u) => u.id !== user.id);

        for (let i = 0; i < this.ENCOUNTERS_PER_USER; i++) {
            const otherUser = this.getRandomUser(otherUsers);
            await this.createEncounter(user, otherUser);
        }
    }

    private getRandomUser(users: User[]): User {
        const randomIndex = Math.floor(Math.random() * users.length);
        return users[randomIndex];
    }

    private async createEncounter(user1: User, user2: User): Promise<void> {
        const encounter = new Encounter();
        encounter.users = [user1, user2];
        encounter.isNearbyRightNow = Math.random() < 0.2; // 20% chance of being nearby
        encounter.lastDateTimePassedBy = this.getRandomPastDate();
        encounter.lastLocationPassedBy = this.getRandomPoint();
        encounter.userStatuses = {
            [user1.id]: this.getRandomStatus(),
            [user2.id]: this.getRandomStatus(),
        };
        // The status will be automatically calculated by the getter
        await this.encounterRepository.save(encounter);
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
