import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "@/types/user.types";
import { generateRandomString } from "../utils/utils";
import { FactoryInterface } from "./factory.interface";

export const MAN_WANTS_MAN_TESTUSER = "MAN_WANTS_MAN_TESTUSER";
export const MAN_WANTS_WOMAN_TESTUSER = "MAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_WOMAN_TESTUSER = "WOMAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_MAN_TESTUSER = "WOMAN_WANTS_MAN_TESTUSER";

export class UserFactory implements FactoryInterface {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public async persistTestUser(userData?: Partial<User>): Promise<User> {
        const user = this.userRepository.create({
            firstName: `Name ${generateRandomString(10)}`,
            bio: generateRandomString(15),
            dateMode: EDateMode.LIVE,
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            email: `${generateRandomString(15)}@example.com`,
            passwordHash: "hashed_password",
            passwordSalt: "salt",
            birthDay: new Date("1990-01-01"),
            approachFromTime: new Date("2024-01-01T01:00:00Z"),
            approachToTime: new Date("2030-01-02T23:59:59Z"),
            location: { type: "Point", coordinates: [0.001, 0.001] },
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.BOTH,
            trustScore: 1,
            ...userData,
        });

        const savedUser = await this.userRepository.save(user);
        savedUser.verificationStatus = userData?.verificationStatus
            ? userData.verificationStatus
            : EVerificationStatus.VERIFIED;

        return await this.userRepository.save(savedUser);
    }

    public async createMainAppUser() {
        await this.persistTestUser({
            firstName: MAN_WANTS_MAN_TESTUSER,
            gender: EGender.MAN,
            genderDesire: [EGender.MAN],
            location: { type: "Point", coordinates: [0, 0] },
            dateMode: EDateMode.LIVE,
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.APPROACH,
        });
        await this.persistTestUser({
            firstName: MAN_WANTS_WOMAN_TESTUSER,
            gender: EGender.MAN,
            genderDesire: [EGender.WOMAN],
            location: { type: "Point", coordinates: [0, 0] },
            dateMode: EDateMode.LIVE,
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.APPROACH,
        });
        await this.persistTestUser({
            firstName: WOMAN_WANTS_WOMAN_TESTUSER,
            gender: EGender.WOMAN,
            genderDesire: [EGender.WOMAN],
            location: { type: "Point", coordinates: [0, 0] },
            dateMode: EDateMode.LIVE,
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.APPROACH,
        });
        await this.persistTestUser({
            firstName: WOMAN_WANTS_MAN_TESTUSER,
            gender: EGender.WOMAN,
            genderDesire: [EGender.WOMAN],
            location: { type: "Point", coordinates: [0, 0] },
            dateMode: EDateMode.LIVE,
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.APPROACH,
        });
    }
}
