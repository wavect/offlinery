import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { Message } from "@/entities/messages/message.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { UserService } from "@/entities/user/user.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { DataSource, Repository } from "typeorm";

/**
 * Use for bigger services that rely on many (if not all) services
 */
export const getUnitTestingModule = () => {
    return Test.createTestingModule({
        providers: [
            UserService,
            MatchingService,
            {
                provide: I18nService,
                useValue: {
                    t: jest.fn().mockReturnValue("Translated text"),
                },
            },
            {
                provide: UserRepository,
                useValue: {
                    getPotentialMatchesForNotifications: jest.fn(),
                    getPotentialMatchesForHeatMap: jest.fn(),
                },
            },
            {
                provide: EncounterService,
                useValue: {
                    saveEncountersForUser: jest.fn(),
                },
            },
            {
                provide: NotificationService,
                useValue: {
                    sendPushNotification: jest.fn(),
                },
            },
            {
                provide: getRepositoryToken(User),
                useClass: Repository,
            },
            {
                provide: getRepositoryToken(PendingUser),
                useClass: Repository,
            },
            {
                provide: getRepositoryToken(BlacklistedRegion),
                useClass: Repository,
            },
            {
                provide: DataSource,
                useValue: {},
            },
            {
                provide: getRepositoryToken(Encounter),
                useClass: Repository,
            },
            {
                provide: getRepositoryToken(Message),
                useClass: Repository,
            },
        ],
    }).compile();
};
