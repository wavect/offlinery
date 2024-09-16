import { AuthService } from "@/auth/auth.service";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

export const getUnitTestingModule = async (): Promise<TestingModule> => {
    const mockRepository = jest.fn(() => ({
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        findOneByOrFail: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
            getMany: jest.fn(),
        })),
    }));

    return Test.createTestingModule({
        providers: [
            UserService,
            {
                provide: MatchingService,
                useValue: {
                    checkAndNotifyMatches: jest.fn(),
                },
            },
            {
                provide: AuthService,
                useValue: {
                    signIn: jest.fn(),
                },
            },
            {
                provide: getRepositoryToken(User),
                useFactory: mockRepository,
            },
            {
                provide: getRepositoryToken(PendingUser),
                useFactory: mockRepository,
            },
            {
                provide: getRepositoryToken(BlacklistedRegion),
                useFactory: mockRepository,
            },
            {
                provide: getRepositoryToken(Encounter),
                useFactory: mockRepository,
            },
            {
                provide: getRepositoryToken(Message),
                useFactory: mockRepository,
            },
        ],
    }).compile();
};
