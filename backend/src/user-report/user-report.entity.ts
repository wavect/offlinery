import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Encounter } from "../encounter/encounter.entity";
import { EIncidentType } from "../types/user.types";
import { User } from "../user/user.entity";

@Entity()
export class UserReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    incidentDescription: string;

    @Column()
    keepReporterInTheLoop: boolean;

    @Column({
        type: "enum",
        enum: EIncidentType,
    })
    incidentType: EIncidentType;

    @CreateDateColumn()
    reportedOn: Date;

    @ManyToOne(() => User, (user) => user.receivedReports)
    reportedUser: User;

    @ManyToOne(() => User, (user) => user.issuedReports)
    reportingUser: User;

    @ManyToOne(() => Encounter, (encounter) => encounter.userReports)
    reportedEncounter: Encounter;
}
