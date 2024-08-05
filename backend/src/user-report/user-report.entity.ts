import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import {EIncidentType} from "../types/user.types";

@Entity()
export class UserReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    incidentDescription: string;

    @Column()
    keepReporterInTheLoop: boolean;

    @Column({
        type: 'enum',
        enum: EIncidentType,
    })
    incidentType: EIncidentType;

    @CreateDateColumn()
    reportedOn: Date;

    @ManyToOne(() => User, user => user.receivedReports)
    reportedUser: User;

    @ManyToOne(() => User, user => user.issuedReports)
    reportingUser: User;
}