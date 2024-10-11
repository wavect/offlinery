import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import {
    EApproachChoice,
    EDateMode,
    EGender,
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

    public async persistTestUser(userData?: Partial<User>): Promise<User> {
        const user = this.userRepository.create({
            firstName: `Name ${generateRandomString(10)}`,
            bio: generateRandomString(15),
            dateMode: EDateMode.LIVE,
            gender: EGender.WOMAN,
            genderDesire: EGender.MAN,
            email: `generated-${generateRandomString(15)}@example.com`,
            passwordHash: "hashed_password",
            passwordSalt: "salt",
            birthDay: new Date("1990-01-01"),
            approachFromTime: new Date("2024-01-01T01:00:00Z"),
            approachToTime: new Date("2030-01-02T23:59:59Z"),
            location: { type: "Point", coordinates: [0.001, 0.001] },
            verificationStatus: EVerificationStatus.VERIFIED,
            approachChoice: EApproachChoice.BE_APPROACHED,
            trustScore: 1,
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

    public async createMainAppUser() {
        const testUsers = [
            {
                email: "main-test-user@test.at",
                firstName: MAN_WANTS_WOMAN_TESTUSER,
                gender: EGender.MAN,
                genderDesire: EGender.WOMAN,
            },
        ];

        for (const user of testUsers) {
            const existingUser = await this.userRepository.findOne({
                where: { firstName: user.firstName },
            });
            if (existingUser) await this.userRepository.remove(existingUser);
            await this.persistTestUser({
                ...user,
                location: { type: "Point", coordinates: [0, 0] },
                dateMode: EDateMode.LIVE,
                verificationStatus: EVerificationStatus.VERIFIED,
                approachChoice: EApproachChoice.APPROACH,
            });
        }

        return await this.userRepository.findOne({
            where: { firstName: MAN_WANTS_WOMAN_TESTUSER },
        });
    }
}
