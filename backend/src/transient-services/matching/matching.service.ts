import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { EncounterService } from "@/encounter/encounter.service";
import { I18nTranslations } from "@/translations/i18n.generated";
import {
    EApproachChoice,
    EDateMode,
    EVerificationStatus,
} from "@/types/user.types";
import { User } from "@/user/user.entity";
import { getAge } from "@/utils/date.utils";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";
import { OfflineryNotification } from "../notification/notification-message.type";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class MatchingService {
    constructor(
        private readonly i18n: I18nService<I18nTranslations>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>,
        @Inject(forwardRef(() => NotificationService))
        private notificationService: NotificationService,
        private encounterService: EncounterService,
    ) {}

    private async findNearbyMatches(userToBeApproached: User): Promise<User[]> {
        if (
            !userToBeApproached ||
            !userToBeApproached.location ||
            userToBeApproached.dateMode !== EDateMode.LIVE
        ) {
            return [];
        }

        // Check if user is within any of their blacklisted regions
        const isInBlacklistedRegion =
            (await this.blacklistedRegionRepository
                .createQueryBuilder("region")
                .where("region.user = :userId", {
                    userId: userToBeApproached.id,
                })
                .andWhere(
                    "ST_DWithin(region.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, region.radius)",
                    {
                        lon: userToBeApproached.location.coordinates[0],
                        lat: userToBeApproached.location.coordinates[1],
                    },
                )
                .getCount()) > 0;

        if (isInBlacklistedRegion) {
            return [];
        }

        // TODO: Also check here whether user to be approached is in approachTime she chose (time zone sensitive, OF-43)

        const userAge = getAge(userToBeApproached.birthDay);

        // TODO: This algorithm should be improved over time (e.g. age, etc. based on user settings, attractivity etc.)
        // TODO: age, distance, etc. should be configurable over time
        const potentialMatchesThatWantToApproach = await this.userRepository
            .createQueryBuilder("user")
            .where("user.id != :userId", { userId: userToBeApproached.id })
            .andWhere("user.gender = :desiredGender", {
                desiredGender: userToBeApproached.genderDesire,
            })
            .andWhere("user.genderDesire = :userGender", {
                userGender: userToBeApproached.gender,
            })
            .andWhere(
                "(user.verificationStatus = :verificationStatusNotNeeded OR user.verificationStatus = :verificationStatusVerified)",
                {
                    verificationStatusVerified: EVerificationStatus.VERIFIED,
                    verificationStatusNotNeeded: EVerificationStatus.NOT_NEEDED,
                },
            )
            .andWhere("user.dateMode = :liveMode", { liveMode: EDateMode.LIVE })
            .andWhere("user.approachChoice = :approach", {
                approach: EApproachChoice.APPROACH,
            })
            .andWhere(
                "ST_DWithin(user.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distance)",
                {
                    lon: userToBeApproached.location.coordinates[0],
                    lat: userToBeApproached.location.coordinates[1],
                    distance: 750, // 750 meters
                },
            )
            .andWhere(
                "EXTRACT(YEAR FROM AGE(user.birthDay)) BETWEEN :minAge AND :maxAge",
                {
                    minAge: userAge - 15,
                    maxAge: userAge + 15,
                },
            )
            .getMany();

        return potentialMatchesThatWantToApproach;
    }

    async checkAndNotifyMatches(userToBeApproached: User): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(userToBeApproached);

        if (nearbyMatches.length > 0) {
            const baseNotification: Omit<OfflineryNotification, "to"> = {
                sound: "default",
                title: this.i18n.t("main.notification.newMatch.title", {
                    args: { firstName: userToBeApproached.firstName },
                }),
                body: this.i18n.t("main.notification.newMatch.body"),
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: userToBeApproached.convertToPublicDTO(),
                },
            };

            const notifications: OfflineryNotification[] = nearbyMatches.map(
                (m) => {
                    return { ...baseNotification, to: m.pushToken };
                },
            );

            await this.notificationService.sendPushNotification(notifications);

            // now save as encounters into DB
            await this.encounterService.saveEncountersForUser(
                userToBeApproached,
                nearbyMatches,
            );
        }
    }
}
