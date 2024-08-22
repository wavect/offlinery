import {Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn, ManyToOne, ManyToMany} from 'typeorm';
import {
    EEncounterStatus
} from "../types/user.types";
import {User} from "../user/user.entity";

@Entity()
export class Encounter {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({default: EEncounterStatus.NOT_MET})
    status: EEncounterStatus;

    @Column({ type: 'timestamptz'})
    lastDateTimePassedBy: Date

    @Column()
    lastLongitudePassedBy: string

    @Column()
    lastLatitudePassedBy: string

    @Column({default: false})
    reported: boolean

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
    @ManyToMany(() => User, user => user.encounters)
    users: User[]; // NOTE: Make sure the combination of users is UNIQUE (can't be enforced on DB level)
}