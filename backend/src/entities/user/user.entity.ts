import { UserPrivateDTO } from "@/DTOs/user-private.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EGenderDesire,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { Point } from "geojson";
import {
    BeforeInsert,
    Column,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User implements IEntityToDTOInterface<UserPublicDTO> {
    /** @dev Important to not return any sensitive data */
    public convertToPublicDTO(): UserPublicDTO {
        return {
            id: this.id,
            firstName: this.firstName,
            age: getAge(this.birthDay),
            /** @dev Don't contain any baseUri, assuming images are hosted on same backend for now. */
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
            markedForDeletion:
                !!this.deletionToken && this.deletionTokenExpires > new Date(),
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
    genderDesire: EGenderDesire;

    @Column("text", { array: true, nullable: true })
    imageURIs: string[];

    @Column()
    verificationStatus: EVerificationStatus;

    @Column()
    approachChoice: EApproachChoice;

    @OneToMany(
        () => BlacklistedRegion,
        (blacklistedRegion) => blacklistedRegion.user,
        { cascade: true, onDelete: "CASCADE" },
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

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ nullable: true })
    refreshTokenExpires: Date;

    @Column()
    dateMode: EDateMode;

    @Column({ nullable: true })
    pushToken: string;

    @OneToMany(() => UserReport, (report) => report.reportedUser, {
        cascade: true,
        onDelete: "CASCADE",
    })
    receivedReports: UserReport[];

    @OneToMany(() => UserReport, (report) => report.reportingUser, {
        cascade: true,
        onDelete: "CASCADE",
    })
    issuedReports: UserReport[];

    @ManyToMany(() => Encounter, (encounter) => encounter.users, {
        cascade: true,
        onDelete: "CASCADE",
    })
    @JoinTable()
    encounters: Encounter[];

    @Column({ nullable: true })
    trustScore?: number;

    @Index({ spatial: true })
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: true,
    })
    location: Point;

    @Column({ nullable: true })
    preferredLanguage: ELanguage;

    @Column({ nullable: true })
    resetPasswordCode: string;

    @Column({ type: "timestamptz", nullable: true })
    resetPasswordCodeIssuedAt: Date;

    @Column({ nullable: true })
    deletionTokenExpires: Date;

    /** @dev This is a secret as it enables people to delete your account! */
    @Column({ nullable: true, unique: true })
    deletionToken: string;

    @BeforeInsert()
    beforeInsert() {
        this.verificationStatus =
            this.approachChoice === EApproachChoice.APPROACH
                ? EVerificationStatus.PENDING
                : EVerificationStatus.NOT_NEEDED;
    }
}
