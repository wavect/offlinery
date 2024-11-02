import { Encounter } from "@/entities/encounter/encounter.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { EEncounterStatus } from "@/types/user.types";
import { Point } from "geojson";
import { Repository } from "typeorm";
import { FactoryInterface } from "./factory.interface";

export class EncounterFactory implements FactoryInterface {
    private encounterRepository: Repository<Encounter>;
    private userRepository: UserRepository;

    constructor(
        useRepository: UserRepository,
        encounterRepository: Repository<Encounter>,
    ) {
        this.userRepository = useRepository;
        this.encounterRepository = encounterRepository;
    }

    public getRandomPastDate = (): Date => {
        const now = new Date();
        return new Date(
            now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        );
    };

    public getRandomPoint = (): Point => {
        return {
            type: "Point",
            coordinates: [
                16.363449 + (Math.random() - 0.5) * 0.1, // Longitude (Vienna-centric)
                48.210033 + (Math.random() - 0.5) * 0.1, // Latitude (Vienna-centric)
            ],
        };
    };

    public persistNewTestEncounter = async (
        user1,
        user2,
        otherConfiguration?: Partial<Encounter>,
    ): Promise<Encounter> => {
        const encounter = await this.encounterRepository.create({
            users: [user1, user2],
            lastDateTimePassedBy: this.getRandomPastDate(),
            lastLocationPassedBy: this.getRandomPoint(),
            userStatuses: {
                [user1.id]: EEncounterStatus.MET_INTERESTED,
                [user2.id]: EEncounterStatus.MET_INTERESTED,
            },
            messages: [],
            status: EEncounterStatus.MET_INTERESTED,
            ...otherConfiguration,
        });

        if (!user2.encounters?.length) {
            user2.encounters = [];
        }

        if (!user1.encounters?.length) {
            user1.encounters = [];
        }

        await this.encounterRepository.save(encounter);

        user1.encounters.push(encounter);
        await this.userRepository.save(user1);

        user2.encounters.push(encounter);
        await this.userRepository.save(user2);

        return encounter;
    };
}
