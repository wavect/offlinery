import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EApproachChoice, EDateMode, EVerificationStatus, EGender } from "../types/user.types";
import { BlacklistedRegion } from '../blacklisted-region/blacklisted-region.entity';

@Entity()
export class User {
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

    @Column()
    birthDay: Date;

    @Column()
    gender: EGender;

    @Column()
    genderDesire: EGender;

    @Column('json')
    images: { filename: string; mimetype: string; path: string }[];

    @Column()
    verificationStatus: EVerificationStatus;

    @Column()
    approachChoice: EApproachChoice;

    @OneToMany(() => BlacklistedRegion, blacklistedRegion => blacklistedRegion.user)
    blacklistedRegions: BlacklistedRegion[];

    @Column()
    approachFromTime: Date;

    @Column()
    approachToTime: Date;

    @Column()
    bio: string;

    @Column()
    dateMode: EDateMode;
}