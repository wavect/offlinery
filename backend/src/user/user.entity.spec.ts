import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { User } from "./user.entity";

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
        it("should return a UserPrivateDTO with correct properties", () => {
            user.isActive = true;
            user.wantsEmailUpdates = false;
            user.blacklistedRegions = [new BlacklistedRegion()];

            const privateDTO = user.convertToPrivateDTO();

            expect(privateDTO).toEqual({
                id: "1",
                firstName: "John",
                age: getAge(user.birthDay),
                imageURIs: ["image1.jpg", "image2.jpg"],
                bio: "Hello, I am John",
                trustScore: 85,
                isActive: true,
                birthDay: user.birthDay,
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
                wantsEmailUpdates: false,
                blacklistedRegions: [expect.any(BlacklistedRegion)],
                email: "john@example.com",
                approachChoice: EApproachChoice.BOTH,
                approachFromTime: user.approachFromTime,
                approachToTime: user.approachToTime,
                dateMode: EDateMode.LIVE,
                verificationStatus: EVerificationStatus.VERIFIED,
            });
        });
    });
});
