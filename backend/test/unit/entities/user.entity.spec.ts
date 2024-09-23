import { BlacklistedRegion } from "../../../src/entities/blacklisted-region/blacklisted-region.entity";
import { User } from "../../../src/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "../../../src/types/user.types";
import { getAge } from "../../../src/utils/date.utils";

describe("User Entity", () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        user.id = "1";
        user.firstName = "John";
        user.email = "john@example.com";
        user.birthDay = new Date("1990-01-01");
        user.gender = EGender.MAN;
        user.genderDesire = EGender.WOMAN;
        user.imageURIs = ["image1.jpg", "image2.jpg"];
        user.verificationStatus = EVerificationStatus.VERIFIED;
        user.approachChoice = EApproachChoice.BOTH;
        user.approachFromTime = new Date("2023-01-01T09:00:00Z");
        user.approachToTime = new Date("2023-01-01T17:00:00Z");
        user.bio = "Hello, I am John";
        user.dateMode = EDateMode.LIVE;
        user.trustScore = 85;
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
        /** @BRITTLE
         * - This test is brittle and should be refactored.
         * - Any time, we change the DTO this test breaks.
         */
        it("should return a UserPrivateDTO with correct properties", () => {
            user.isActive = true;
            user.wantsEmailUpdates = false;
            user.blacklistedRegions = [new BlacklistedRegion()];

            const privateDTO = user.convertToPrivateDTO();

            /** @TODO
             * - add more properties, that should be tested
             * - never test against the whole object*/
            expect(privateDTO.dateMode).toEqual(EDateMode.LIVE);
        });
    });
});
