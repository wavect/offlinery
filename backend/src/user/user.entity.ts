import {Entity, Column, PrimaryGeneratedColumn, OneToMany, PrimaryColumn} from 'typeorm';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';
import {UserPublicDTO} from "../DTOs/user-public.dto";
import {UserReport} from "../user-report/user-report.entity";
import {UserPrivateDTO} from "../DTOs/user-private.dto";

@Entity()
export class User {

    /** @dev Important to not return any sensitive data */
    public convertToPublicDTO(): UserPublicDTO {
        return {
            id: this.id,
            isActive: this.isActive,
            firstName: this.firstName,
            birthDay: this.birthDay,
            gender: this.gender,
            genderDesire: this.genderDesire,
            imageURIs: this.imageURIs,
            verificationStatus: this.verificationStatus,
            approachChoice: this.approachChoice,
            approachFromTime: this.approachFromTime,
            approachToTime: this.approachToTime,
            bio: this.bio,
            dateMode: this.dateMode,

        };
    }

    /** @dev Meant to be only viewable by user itself. */
    public convertToPrivateDTO(): UserPrivateDTO {
        return {
            ...this.convertToPublicDTO(),
            wantsEmailUpdates: this.wantsEmailUpdates,
            blacklistedRegions: this.blacklistedRegions,
            email: this.email,
        }
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    firstName: string;

    @Column({ default: false })
    wantsEmailUpdates: boolean;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column()
    passwordSalt: string;

    @Column({ type: 'date'})
    birthDay: Date;

    @Column()
    gender: EGender;

    @Column()
    genderDesire: EGender;

    @Column("text", {array: true, nullable: true})
    imageURIs: string[];

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