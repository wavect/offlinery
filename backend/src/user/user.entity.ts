import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BlacklistedRegion } from "../blacklisted-region/blacklisted-region.entity";
import { UserPrivateDTO } from "../DTOs/user-private.dto";
import { UserPublicDTO } from "../DTOs/user-public.dto";
import { Encounter } from "../encounter/encounter.entity";
import { IEntityToDTOInterface } from "../interfaces/IEntityToDTO.interface";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "../types/user.types";
import { UserReport } from "../user-report/user-report.entity";
import { getAge } from "../utils/date.utils";

@Entity()
export class User implements IEntityToDTOInterface<UserPublicDTO> {
    /** @dev Important to not return any sensitive data */
    public convertToPublicDTO(): UserPublicDTO {
        return {
            id: this.id,
            firstName: this.firstName,
            age: getAge(this.birthDay),
            imageURIs: this.imageURIs,
            bio: this.bio,
            trustScore: this.trustScore,
        };
    }

    /** @dev Meant to be only viewable by user itself. */
    public convertToPrivateDTO(): UserPrivateDTO {
        return {
            ...this.convertToPublicDTO(),
            isActive: this.isActive,
            birthDay: this.birthDay,
            gender: this.gender,
            genderDesire: this.genderDesire,
            wantsEmailUpdates: this.wantsEmailUpdates,
            blacklistedRegions: this.blacklistedRegions,
            email: this.email,
            approachChoice: this.approachChoice,
            approachFromTime: this.approachFromTime,
            approachToTime: this.approachToTime,
            dateMode: this.dateMode,
            verificationStatus: this.verificationStatus,
        };
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

    @Column({ type: "date" })
    birthDay: Date;

    @Column()
    gender: EGender;

    @Column()
    genderDesire: EGender;

    @Column("text", { array: true, nullable: true })
    imageURIs: string[];

    @Column()
    verificationStatus: EVerificationStatus;

    @Column()
    approachChoice: EApproachChoice;

    @OneToMany(
        () => BlacklistedRegion,
        (blacklistedRegion) => blacklistedRegion.user,
    )
    blacklistedRegions: BlacklistedRegion[];

    // timestamptz (PostgreSQL datetime with timezone)
    @Column({ type: "timestamptz" })
    approachFromTime: Date;

    // timestamptz (PostgreSQL datetime with timezone)
    @Column({ type: "timestamptz" })
    approachToTime: Date;

    @Column()
    bio: string;

    @Column()
    dateMode: EDateMode;

    @Column({ nullable: true })
    pushToken: string;

    @OneToMany(() => UserReport, (report) => report.reportedUser)
    receivedReports: UserReport[];

    @OneToMany(() => UserReport, (report) => report.reportingUser)
    issuedReports: UserReport[];

    @OneToMany(() => Encounter, (encounter) => encounter.users)
    encounters: Encounter[];

    @Column({ nullable: true })
    trustScore?: number;
}
