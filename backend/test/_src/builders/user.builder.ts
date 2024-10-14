import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Point } from "geojson";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";

export class UserBuilder extends AbstractEntityBuilder<User> {
    protected createInitialEntity(): User {
        const user = new User();
        user.id = "00000000-0000-0000-0000-000000000000";
        user.isActive = true;
        user.firstName = "John";
        user.email = "john@example.com";
        user.passwordHash = "hashedpassword";
        user.passwordSalt = "salt";
        user.birthDay = new Date("1990-01-01");
        user.gender = EGender.MAN;
        user.genderDesire = [EGender.WOMAN];
        user.imageURIs = ["https://example.com/image.jpg"];
        user.verificationStatus = EVerificationStatus.VERIFIED;
        user.approachChoice = EApproachChoice.APPROACH;
        user.approachFromTime = new Date("2023-01-01T09:00:00Z");
        user.approachToTime = new Date("2023-01-01T17:00:00Z");
        user.bio = "Hello, I am John";
        user.dateMode = EDateMode.LIVE;
        user.trustScore = 100;
        user.location = { type: "Point", coordinates: [0, 0] };
        user.preferredLanguage = ELanguage.en;
        return user;
    }

    withId(id: string): this {
        this.entity.id = id;
        return this;
    }

    withIsActive(isActive: boolean): this {
        this.entity.isActive = isActive;
        return this;
    }

    withFirstName(firstName: string): this {
        this.entity.firstName = firstName;
        return this;
    }

    withWantsEmailUpdates(wantsEmailUpdates: boolean): this {
        this.entity.wantsEmailUpdates = wantsEmailUpdates;
        return this;
    }

    withEmail(email: string): this {
        this.entity.email = email;
        return this;
    }

    withPasswordHash(passwordHash: string): this {
        this.entity.passwordHash = passwordHash;
        return this;
    }

    withPasswordSalt(passwordSalt: string): this {
        this.entity.passwordSalt = passwordSalt;
        return this;
    }

    withBirthDay(birthDay: Date): this {
        this.entity.birthDay = birthDay;
        return this;
    }

    withGender(gender: EGender): this {
        this.entity.gender = gender;
        return this;
    }

    withGenderDesire(genderDesire: EGender[]): this {
        this.entity.genderDesire = genderDesire;
        return this;
    }

    withImageURIs(imageURIs: string[]): this {
        this.entity.imageURIs = imageURIs;
        return this;
    }

    withVerificationStatus(verificationStatus: EVerificationStatus): this {
        this.entity.verificationStatus = verificationStatus;
        return this;
    }

    withApproachChoice(approachChoice: EApproachChoice): this {
        this.entity.approachChoice = approachChoice;
        return this;
    }

    withBlacklistedRegions(blacklistedRegions: BlacklistedRegion[]): this {
        this.entity.blacklistedRegions = blacklistedRegions;
        return this;
    }

    withApproachFromTime(approachFromTime: Date): this {
        this.entity.approachFromTime = approachFromTime;
        return this;
    }

    withApproachToTime(approachToTime: Date): this {
        this.entity.approachToTime = approachToTime;
        return this;
    }

    withBio(bio: string): this {
        this.entity.bio = bio;
        return this;
    }

    withRefreshToken(refreshToken: string): this {
        this.entity.refreshToken = refreshToken;
        return this;
    }

    withRefreshTokenExpires(refreshTokenExpires: Date): this {
        this.entity.refreshTokenExpires = refreshTokenExpires;
        return this;
    }

    withDateMode(dateMode: EDateMode): this {
        this.entity.dateMode = dateMode;
        return this;
    }

    withPushToken(pushToken: string): this {
        this.entity.pushToken = pushToken;
        return this;
    }

    withReceivedReports(receivedReports: UserReport[]): this {
        this.entity.receivedReports = receivedReports;
        return this;
    }

    withIssuedReports(issuedReports: UserReport[]): this {
        this.entity.issuedReports = issuedReports;
        return this;
    }

    withEncounters(encounters: Encounter[]): this {
        this.entity.encounters = encounters;
        return this;
    }

    withTrustScore(trustScore: number): this {
        this.entity.trustScore = trustScore;
        return this;
    }

    withLocation(location: Point): this {
        this.entity.location = location;
        return this;
    }

    withPreferredLanguage(preferredLanguage: ELanguage): this {
        this.entity.preferredLanguage = preferredLanguage;
        return this;
    }

    withResetPasswordCode(resetPasswordCode: string): this {
        this.entity.resetPasswordCode = resetPasswordCode;
        return this;
    }

    withResetPasswordCodeIssuedAt(resetPasswordCodeIssuedAt: Date): this {
        this.entity.resetPasswordCodeIssuedAt = resetPasswordCodeIssuedAt;
        return this;
    }

    withDeletionTokenExpires(deletionTokenExpires: Date): this {
        this.entity.deletionTokenExpires = deletionTokenExpires;
        return this;
    }

    withDeletionToken(deletionToken: string): this {
        this.entity.deletionToken = deletionToken;
        return this;
    }
}
