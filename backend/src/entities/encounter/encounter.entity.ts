import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import { BaseEntity } from "@/entities/base.entity";
import { Message } from "@/entities/messages/message.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { IEntityToDTOWithArgumentInterface } from "@/interfaces/IEntityToDTOWithArgument.interface";
import { EEncounterStatus } from "@/types/user.types";
import { getTypedCoordinatesFromPoint } from "@/utils/location.utils";
import { Point } from "geojson";
import {
    AfterLoad,
    Column,
    Entity,
    Index,
    ManyToMany,
    OneToMany,
} from "typeorm";

@Entity()
export class Encounter
    extends BaseEntity
    implements IEntityToDTOWithArgumentInterface<User, EncounterPublicDTO>
{
    public convertToPublicDTO(user: User): EncounterPublicDTO {
        return {
            id: this.id,
            status: this.status,
            lastDateTimePassedBy: this.lastDateTimePassedBy,
            lastLocationPassedBy: getTypedCoordinatesFromPoint(
                this.lastLocationPassedBy,
            ),
            reported: this.userReports?.length > 0,
            /** @dev Find other user to yourself */
            otherUser: this.users
                ?.find((u) => u.id !== user.id)
                ?.convertToPublicDTO(),
            /** @DEV MAKE DEFAULT [] not check here*/
            messages: this.messages?.map((m) => m.convertToPublicDTO()) ?? [],
            isNearbyRightNow: null,
            amountStreaks: this.amountStreaks,
        };
    }

    @Column({ default: 1 })
    amountStreaks: number;

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
     *     users: { id: In([user1Id]) }
     *   }
     * });
     */
    @ManyToMany(() => User, (user) => user.encounters, { onDelete: "CASCADE" })
    users: User[]; // NOTE: Make sure the combination of users is UNIQUE (can't be enforced on DB level)

    /** @dev Both users could theoretically report each other */
    @OneToMany(() => UserReport, (report) => report.reportedEncounter, {
        onDelete: "CASCADE",
    })
    userReports: UserReport[];

    /** @dev Simple chat conversation between users, to e.g. exchange contact details. Not suitable for a real chat. */
    @OneToMany(() => Message, (message) => message.encounter, {
        nullable: true,
        onDelete: "CASCADE",
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
        if (!this.userStatuses) {
            this.userStatuses = {};
        }
        this.userStatuses[userId] = status;
        this.updateStatus();
    }
}
