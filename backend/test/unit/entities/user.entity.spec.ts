import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
    EVerificationStatus,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { UserBuilder } from "../../_src/builders/user.builder";

describe("User Entity", () => {
    let user: User;

    beforeEach(() => {
        user = new UserBuilder()
            .withId("1")
            .withFirstName("John")
            .withEmail("john@example.com")
            .withBirthDay(new Date("1990-01-01"))
            .withGender(EGender.MAN)
            .withGenderDesire([EGender.WOMAN])
            .withIntentions([EIntention.RELATIONSHIP])
            .withImageURIs(["image1.jpg", "image2.jpg"])
            .withVerificationStatus(EVerificationStatus.VERIFIED)
            .withApproachChoice(EApproachChoice.BOTH)
            .withApproachFromTime(new Date("2023-01-01T09:00:00Z"))
            .withApproachToTime(new Date("2023-01-01T17:00:00Z"))
            .withBio("Hello, I am John")
            .withDateMode(EDateMode.LIVE)
            .withTrustScore(85)
            .build();
    });

    describe("convertToPublicDTO", () => {
        it("should return a UserPublicDTO with correct properties", () => {
            const publicDTO = user.convertToPublicDTO();
            expect(publicDTO).toEqual({
                id: "1",
                firstName: "John",
                age: getAge(user.birthDay),
                imageURIs: ["image1.jpg", "image2.jpg"],
                bio: "Hello, I am John",
                trustScore: 85,
            });
        });
    });

    describe("convertToPrivateDTO", () => {
        it("should return a UserPrivateDTO with correct properties", () => {
            const privateUser = new UserBuilder()
                .withDateMode(EDateMode.LIVE)
                .withIsActive(true)
                .withWantsEmailUpdates(false)
                .withBlacklistedRegions([new BlacklistedRegion()])
                .build();

            expect(privateUser.convertToPrivateDTO().dateMode).toEqual(
                EDateMode.LIVE,
            );
        });
    });
});
