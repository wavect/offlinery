import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
    EVerificationStatus,
} from "@/types/user.types";
import { Repository } from "typeorm";
import { generateRandomString } from "../utils/utils";
import { FactoryInterface } from "./factory.interface";

export const MAN_WANTS_MAN_TESTUSER = "MAN_WANTS_MAN_TESTUSER";
export const MAN_WANTS_WOMAN_TESTUSER = "MAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_WOMAN_TESTUSER = "WOMAN_WANTS_WOMAN_TESTUSER";
export const WOMAN_WANTS_MAN_TESTUSER = "WOMAN_WANTS_MAN_TESTUSER";

export class UserFactory implements FactoryInterface {
    private userRepository: UserRepository;
    private blacklistedRegionRepository: Repository<BlacklistedRegion>;

    constructor(
        userRepository: UserRepository,
        blacklistedRegionRepository: Repository<BlacklistedRegion>,
    ) {
        this.userRepository = userRepository;
        this.blacklistedRegionRepository = blacklistedRegionRepository;
    }

    public async persistNewTestUser(userData?: Partial<User>): Promise<User> {
        /** @DEV predefine here to re-use */
        const pushToken = `G-${generateRandomString(15)}`;

        const user = this.userRepository.create({
            firstName: `G-${generateRandomString(15)}`,
            bio: generateRandomString(15),
            dateMode: EDateMode.LIVE,
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            email: `G-${generateRandomString(15)}@example.com`,
            passwordHash: "hashed_password",
            passwordSalt: "salt",
            birthDay: new Date("1990-01-01"),
            approachFromTime: new Date("2024-01-01T01:00:00Z"),
            approachToTime: new Date("2030-01-02T23:59:59Z"),
            locationLastTimeUpdated: new Date(
                new Date().getTime() - 2 * 60 * 60 * 1000,
            ),
            location: { type: "Point", coordinates: [0.001, 0.001] },
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.BE_APPROACHED,
            pushToken,
            trustScore: 1,
            ageRangeString: "[18,99]",
            ...userData,
        });

        const savedUser = await this.userRepository.save(user);
        savedUser.verificationStatus = userData?.verificationStatus
            ? userData.verificationStatus
            : EVerificationStatus.VERIFIED;

        return await this.userRepository.save(savedUser);
    }

    public async updateTestUser(userData: Partial<User>): Promise<User> {
        return await this.userRepository.save({
            ...(await this.userRepository.findOneBy({
                email: "main-test-user@test.at",
            })),
            ...userData,
        });
    }
}
