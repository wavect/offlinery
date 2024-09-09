import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EVerificationStatus,
} from "@/types/user.types";
import { DataSource } from "typeorm";
import { generateRandomString } from "../utils/utils";

export const MAN_WANTS_MAN_TESTUSER = "MAN_WANTS_MAN_TESTUSER";
export const MAN_WANTS_WOMAN_TESTUSER = "MAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_WOMAN_TESTUSER = "WOMAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_MAN_TESTUSER = "WOMAN_WANTS_MAN_TESTUSER";

export const createRandomAppUser = async (
    userRepository: UserRepository,
    userData: Partial<User>,
): Promise<User> => {
    const user = userRepository.create({
        firstName: `Name ${generateRandomString(10)}`,
        bio: generateRandomString(15),
        dateMode: EDateMode.LIVE,
        gender: EGender.WOMAN,
        genderDesire: EGender.MAN,
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

    return await userRepository.save(user);
};

export const createMainAppUser = async (userRepository: UserRepository) => {
    await createRandomAppUser(userRepository, {
        firstName: MAN_WANTS_MAN_TESTUSER,
        gender: EGender.MAN,
        genderDesire: EGender.MAN,
        location: { type: "Point", coordinates: [0, 0] },
        dateMode: EDateMode.LIVE,
        verificationStatus: EVerificationStatus.VERIFIED,
        approachChoice: EApproachChoice.BE_APPROACHED,
    });
    await createRandomAppUser(userRepository, {
        firstName: MAN_WANTS_WOMAN_TESTUSER,
        gender: EGender.MAN,
        genderDesire: EGender.WOMAN,
        location: { type: "Point", coordinates: [0, 0] },
        dateMode: EDateMode.LIVE,
        verificationStatus: EVerificationStatus.VERIFIED,
        approachChoice: EApproachChoice.BE_APPROACHED,
    });
    await createRandomAppUser(userRepository, {
        firstName: WOMAN_WANTS_WOMAN_TESTUSER,
        gender: EGender.WOMAN,
        genderDesire: EGender.WOMAN,
        location: { type: "Point", coordinates: [0, 0] },
        dateMode: EDateMode.LIVE,
        verificationStatus: EVerificationStatus.VERIFIED,
        approachChoice: EApproachChoice.BE_APPROACHED,
    });
    await createRandomAppUser(userRepository, {
        firstName: WOMAN_WANTS_MAN_TESTUSER,
        gender: EGender.WOMAN,
        genderDesire: EGender.WOMAN,
        location: { type: "Point", coordinates: [0, 0] },
        dateMode: EDateMode.LIVE,
        verificationStatus: EVerificationStatus.VERIFIED,
        approachChoice: EApproachChoice.BE_APPROACHED,
    });
};

export const clearDatabase = async (dataSource: DataSource) => {
    await dataSource.query(`
            TRUNCATE TABLE "user", encounter RESTART IDENTITY CASCADE;
        `);
};
