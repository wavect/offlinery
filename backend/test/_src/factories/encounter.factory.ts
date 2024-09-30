import { Encounter } from "@/entities/encounter/encounter.entity";
import { EEncounterStatus } from "@/types/user.types";
import { Point } from "geojson";

export const getRandomPastDate = (): Date => {
    const now = new Date();
    return new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
};

export const getRandomPoint = (): Point => {
    return {
        type: "Point",
        coordinates: [
            16.363449 + (Math.random() - 0.5) * 0.1, // Longitude (Vienna-centric)
            48.210033 + (Math.random() - 0.5) * 0.1, // Latitude (Vienna-centric)
        ],
    };
};

export const createRandomEncounter = async (
    user1,
    user2,
    encounterRepository,
    userRepository,
): Promise<Encounter> => {
    const encounter = new Encounter();
    encounter.users = [user1, user2];
    encounter.isNearbyRightNow = Math.random() < 0.2;
    encounter.lastDateTimePassedBy = getRandomPastDate();
    encounter.lastLocationPassedBy = getRandomPoint();
    encounter.userStatuses = {
        [user1.id]: EEncounterStatus.MET_INTERESTED,
        [user2.id]: EEncounterStatus.MET_INTERESTED,
    };

    const savedEncounter = await encounterRepository.save(encounter);

    if (!user2.encounters?.length) {
        user2.encounters = [];
    }

    if (!user1.encounters?.length) {
        user1.encounters = [];
    }

    user1.encounters.push(encounter);
    await userRepository.save(user1);

    user2.encounters.push(encounter);
    await userRepository.save(user2);

    return savedEncounter;
};
