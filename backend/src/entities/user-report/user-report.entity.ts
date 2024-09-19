import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { EIncidentType } from "@/types/user.types";
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";

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

    @ManyToOne(() => User, (user) => user.receivedReports, {
        onDelete: "CASCADE",
    })
    reportedUser: User;

    @ManyToOne(() => User, (user) => user.issuedReports, {
        onDelete: "CASCADE",
    })
    reportingUser: User;

    @ManyToOne(() => Encounter, (encounter) => encounter.userReports, {
        onDelete: "CASCADE",
    })
    reportedEncounter: Encounter;
}
