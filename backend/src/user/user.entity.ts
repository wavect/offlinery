import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';
import {UserPublicDTO} from "../DTOs/user-public.dto";
import {UserReport} from "../user-report/user-report.entity";

@Entity()
export class User {

    /** @dev Important to not return any sensitive data */
    public convertToPublicDTO(): UserPublicDTO {
        return {
            id: this.id,
            isActive: this.isActive,
            firstName: this.firstName,
            wantsEmailUpdates: this.wantsEmailUpdates,
            birthDay: this.birthDay,
            gender: this.gender,
            genderDesire: this.genderDesire,
            images: this.images,
            verificationStatus: this.verificationStatus,
            approachChoice: this.approachChoice,
            approachFromTime: this.approachFromTime,
            approachToTime: this.approachToTime,
            bio: this.bio,
            dateMode: this.dateMode
        };
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    firstName: string;

    @Column({ default: false })
    wantsEmailUpdates: boolean;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    passwordSalt: string;

    // Date only
    @Column({ type: 'date'})
    birthDay: string;

    @Column()
    gender: EGender;

    @Column()
    genderDesire: EGender;

    @Column('json')
    images: Express.Multer.File[];

    @Column()
    verificationStatus: EVerificationStatus;

    @Column()
    approachChoice: EApproachChoice;

    @OneToMany(() => BlacklistedRegion, blacklistedRegion => blacklistedRegion.user)
    blacklistedRegions: BlacklistedRegion[];

    // timestamptz (PostgreSQL datetime with timezone)
    @Column({ type: 'timestamptz' })
    approachFromTime: Date;

    // timestamptz (PostgreSQL datetime with timezone)
    @Column({ type: 'timestamptz' })
    approachToTime: Date;

    @Column()
    bio: string;

    @Column()
    dateMode: EDateMode;

    @Column({ nullable: true })
    pushToken: string;

    @OneToMany(() => UserReport, report => report.reportedUser)
    receivedReports: UserReport[];

    @OneToMany(() => UserReport, report => report.reportingUser)
    issuedReports: UserReport[];
}