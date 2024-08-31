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
}
