import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    ELanguage,
    EVerificationStatus,
} from "@/types/user.types";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";

export class UserEntityBuilder extends AbstractEntityBuilder<User> {
    protected createEntity(): User {
        const user = new User();
        user.id = "00000000-0000-0000-0000-000000000000";
        user.isActive = true;
        user.firstName = "John";
        user.email = "john@example.com";
        user.passwordHash = "hashedpassword";
        user.passwordSalt = "salt";
        user.birthDay = new Date("1990-01-01");
        user.gender = EGender.MAN;
        user.genderDesire = EGender.WOMAN;
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
}
