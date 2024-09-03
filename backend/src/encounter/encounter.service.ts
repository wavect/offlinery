import { User } from "@/user/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Encounter } from "./encounter.entity";

@Injectable()
export class EncounterService {
    constructor(
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) {}

    async findEncountersByUser(userId: string): Promise<Encounter[]> {
        const encounters = await this.encounterRepository.find({
            where: { id: userId },
        });

        if (!encounters) {
            throw new NotFoundException(
                `Encounters from user with ID ${userId} not found`,
            );
        }

        return encounters;
    }

    async saveEncountersForUser(
        userToBeApproached: User,
        usersThatWantToApproach: User[],
    ) {
        for (const u of usersThatWantToApproach) {
            const encounter = new Encounter();
            encounter.users = [userToBeApproached, u];
            encounter.lastDateTimePassedBy = new Date();
            encounter.lastLocationPassedBy = userToBeApproached.location;
            encounter.userReports = [];

            await this.encounterRepository.save(encounter);
        }
    }
}
