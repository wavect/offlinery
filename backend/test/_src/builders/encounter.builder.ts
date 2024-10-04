import { Encounter } from "@/entities/encounter/encounter.entity";
import { EEncounterStatus } from "@/types/user.types";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";

export class EncounterBuilder extends AbstractEntityBuilder<Encounter> {
    protected createEntity(): Encounter {
        const encounter = new Encounter();
        encounter.id = "00000000-0000-0000-0000-000000000000";
        encounter.isNearbyRightNow = true;
        encounter.lastDateTimePassedBy = new Date();
        encounter.status = EEncounterStatus.MET_INTERESTED;
        encounter.lastLocationPassedBy = {
            type: "Point",
            coordinates: [0, 0],
        };
        encounter.messages = [];
        encounter.users = [];
        encounter.userReports = [];
        return encounter;
    }
}
