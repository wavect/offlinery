import {Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn, ManyToOne} from 'typeorm';
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

    @ManyToOne(() => User, (user) => user.encounters)
    userNearby: User;

    @ManyToOne(() => User, (user) => user.encounters)
    user2: User;


}