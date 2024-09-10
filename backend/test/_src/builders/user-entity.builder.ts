import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { Point } from "geojson";

export class UserEntityBuilder {
    private user: User;

    constructor() {
        this.user = new User();
        this.user.id = "00000000-0000-0000-0000-000000000000";
        this.user.isActive = true;
        this.user.firstName = "John";
        this.user.email = "john@example.com";
        this.user.passwordHash = "hashedpassword";
        this.user.passwordSalt = "salt";
        this.user.birthDay = new Date("1990-01-01");
        this.user.gender = EGender.MAN;
        this.user.genderDesire = EGender.WOMAN;
        this.user.imageURIs = ["https://example.com/image.jpg"];
        this.user.verificationStatus = EVerificationStatus.VERIFIED;
        this.user.approachChoice = EApproachChoice.APPROACH;
        this.user.approachFromTime = new Date("2023-01-01T09:00:00Z");
        this.user.approachToTime = new Date("2023-01-01T17:00:00Z");
        this.user.bio = "Hello, I am John";
        this.user.dateMode = EDateMode.LIVE;
        this.user.trustScore = 100;
        this.user.location = { type: "Point", coordinates: [0, 0] } as Point;
        this.user.preferredLanguage = ELanguage.en;
    }

    public withId(id: string): UserEntityBuilder {
        this.user.id = id;
        return this;
    }

    public withFirstName(firstName: string): UserEntityBuilder {
        this.user.firstName = firstName;
        return this;
    }

    public withEmail(email: string): UserEntityBuilder {
        this.user.email = email;
        return this;
    }

    public withDateMode(dateMode: EDateMode): UserEntityBuilder {
        this.user.dateMode = dateMode;
        return this;
    }

    public withLocation(
        longitude: number,
        latitude: number,
    ): UserEntityBuilder {
        this.user.location = {
            type: "Point",
            coordinates: [longitude, latitude],
        } as Point;
        return this;
    }

    public build(): User {
        return this.user;
    }
}
