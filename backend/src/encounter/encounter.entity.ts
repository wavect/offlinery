import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { EEncounterStatus } from "@/types/user.types";
import { UserReport } from "@/user-report/user-report.entity";
import { User } from "@/user/user.entity";
import {
    Column,
    Entity,
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
            lastLocationPassedBy: undefined, // TODO, derive a rough human readable string (translation??) that can be shown locally
            reported: this.userReports?.length > 0, // TODO: Here we might want to make this boolean specific to the user querying? Otherwise technically only one user can report.
            users: this.users.map((u) => u.convertToPublicDTO()),
        };
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: EEncounterStatus.NOT_MET })
    status: EEncounterStatus;

    @Column({ type: "timestamptz" })
    lastDateTimePassedBy: Date;

    @Column()
    lastLongitudePassedBy: string;

    @Column()
    lastLatitudePassedBy: string;

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
}
