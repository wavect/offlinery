import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import { Message } from "@/entities/messages/message.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { EEncounterStatus } from "@/types/user.types";
import { Point } from "geojson";
import {
    AfterLoad,
    Column,
    Entity,
    Index,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Encounter implements IEntityToDTOInterface<EncounterPublicDTO> {
    public convertToPublicDTO(): EncounterPublicDTO {
        return {
            id: this.id,
            status: this.status,
            lastDateTimePassedBy: this.lastDateTimePassedBy,
            lastLocationPassedBy: undefined, // TODO, derive a rough human readable string (translation??) that can be shown locally, or just give random radius point or so and let users open map or so?
            reported: this.userReports?.length > 0, // TODO: Here we might want to make this boolean specific to the user querying? Otherwise technically only one user can report.
            users: this.users.map((u) => u.convertToPublicDTO()),
            messages: this.messages.map((m) => m.convertToPublicDTO()),
            isNearbyRightNow: this.isNearbyRightNow,
        };
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "boolean", default: false })
    isNearbyRightNow: boolean;

    @Column({ type: "jsonb", default: {} })
    userStatuses: Record<string, EEncounterStatus>;

    @Column({ type: "timestamptz" })
    lastDateTimePassedBy: Date;

    @Index({ spatial: true })
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: true,
    })
    lastLocationPassedBy: Point;

    /** @dev Users that have met, typically 2.
     *
     * Can be queried this way:
     *
     * const encounters = await encounterRepository.find({
     *   relations: ['users'],
     *   where: {
     *     users: { id: In([user1Id, user2Id]) }
     *   }
     * });
     */
    @ManyToMany(() => User, (user) => user.encounters)
    users: User[]; // NOTE: Make sure the combination of users is UNIQUE (can't be enforced on DB level)

    /** @dev Both users could theoretically report each other */
    @OneToMany(() => UserReport, (report) => report.reportedEncounter)
    userReports: UserReport[];

    /** @dev Simple chat conversation between users, to e.g. exchange contact details. Not suitable for a real chat. */
    @OneToMany(() => Message, (message) => message.encounter, {
        nullable: true,
    })
    messages: Message[];

    @Column({
        type: "enum",
        enum: EEncounterStatus,
        default: EEncounterStatus.NOT_MET,
    })
    status: EEncounterStatus;

    @AfterLoad()
    updateStatusAfterLoad() {
        this.status = this.calculateStatus();
    }

    private calculateStatus(): EEncounterStatus {
        const statuses = Object.values(this.userStatuses);
        if (
            statuses.every(
                (status) => status === EEncounterStatus.MET_INTERESTED,
            )
        ) {
            return EEncounterStatus.MET_INTERESTED;
        } else if (
            statuses.some(
                (status) => status === EEncounterStatus.MET_NOT_INTERESTED,
            )
        ) {
            return EEncounterStatus.MET_NOT_INTERESTED;
        } else {
            return EEncounterStatus.NOT_MET;
        }
    }

    public updateStatus(): void {
        this.status = this.calculateStatus();
    }

    public setUserStatus(userId: string, status: EEncounterStatus): void {
        this.userStatuses[userId] = status;
        this.updateStatus();
    }
}
