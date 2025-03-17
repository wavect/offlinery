import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { EEncounterStatus } from "@/types/user.types";
import { Point } from "geojson";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";

export class EncounterBuilder extends AbstractEntityBuilder<Encounter> {
    protected createInitialEntity(): Encounter {
        const encounter = new Encounter();
        encounter.id = "00000000-0000-0000-0000-000000000000";
        encounter.lastDateTimePassedBy = new Date();
        encounter.status = EEncounterStatus.MET_INTERESTED;
        encounter.lastLocationPassedBy = {
            type: "Point",
            coordinates: [0, 0],
        };
        encounter.messages = [];
        encounter.users = [];

        return encounter;
    }

    withId(id: string): this {
        this.entity.id = id;
        return this;
    }

    withUserStatuses(userStatuses: Record<string, EEncounterStatus>): this {
        this.entity.userStatuses = userStatuses;
        return this;
    }

    withLastDateTimePassedBy(lastDateTimePassedBy: Date): this {
        this.entity.lastDateTimePassedBy = lastDateTimePassedBy;
        return this;
    }

    withLastLocationPassedBy(lastLocationPassedBy: Point): this {
        this.entity.lastLocationPassedBy = lastLocationPassedBy;
        return this;
    }

    withUsers(users: User[]): this {
        this.entity.users = users;
        return this;
    }

    withUserReports(userReports: UserReport[]): this {
        this.entity.userReports = userReports;
        return this;
    }

    withMessages(messages: Message[]): this {
        this.entity.messages = messages;
        return this;
    }

    withStatus(status: EEncounterStatus): this {
        this.entity.status = status;
        return this;
    }
}
