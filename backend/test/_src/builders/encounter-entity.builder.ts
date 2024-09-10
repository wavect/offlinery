import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { EEncounterStatus } from "@/types/user.types";
import { Point } from "geojson";

export class EncounterBuilder {
    private encounter: Encounter;

    constructor() {
        this.encounter = new Encounter();
        this.encounter.id = "00000000-0000-0000-0000-000000000000";
        this.encounter.isNearbyRightNow = false;
        this.encounter.userStatuses = {};
        this.encounter.lastDateTimePassedBy = new Date();
        this.encounter.lastLocationPassedBy = {
            type: "Point",
            coordinates: [0, 0],
        } as Point;
        this.encounter.users = [];
        this.encounter.userReports = [];
        this.encounter.messages = [];
        this.encounter.status = EEncounterStatus.NOT_MET;
    }

    public withId(id: string): EncounterBuilder {
        this.encounter.id = id;
        return this;
    }

    public withUsers(users: User[]): EncounterBuilder {
        this.encounter.users = users;
        return this;
    }

    public withStatus(status: EEncounterStatus): EncounterBuilder {
        this.encounter.status = status;
        return this;
    }

    public withUserStatuses(
        userStatuses: Record<string, EEncounterStatus>,
    ): EncounterBuilder {
        this.encounter.userStatuses = userStatuses;
        return this;
    }

    public withLastLocation(
        longitude: number,
        latitude: number,
    ): EncounterBuilder {
        this.encounter.lastLocationPassedBy = {
            type: "Point",
            coordinates: [longitude, latitude],
        } as Point;
        return this;
    }

    public build(): Encounter {
        return this.encounter;
    }
}
