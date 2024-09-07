import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { I18nTranslations } from "@/translations/i18n.generated";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EVerificationStatus,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { find as findTimeZoneByLocation } from "geo-tz";
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

    public isWithinApproachTime(user: User, lat: number, lon: number): boolean {
        const timezoneOfUserLocation = findTimeZoneByLocation(lat, lon);
        const localTime = this.getCurrentTime(timezoneOfUserLocation[0]);

        const approachFromTime = new Date(user.approachFromTime);
        const approachToTime = new Date(user.approachToTime);

        // Convert all times to UTC
        const localTimeUTC = new Date(localTime.toUTCString());
        const fromTimeUTC = new Date(approachFromTime.toUTCString());
        const toTimeUTC = new Date(approachToTime.toUTCString());

        // Normalize times to minutes since midnight UTC
        const toMinutesSinceMidnight = (date: Date) => {
            return date.getUTCHours() * 60 + date.getUTCMinutes();
        };

        let localTimeMinutes = toMinutesSinceMidnight(localTimeUTC);
        const fromTimeMinutes = toMinutesSinceMidnight(fromTimeUTC);
        let toTimeMinutes = toMinutesSinceMidnight(toTimeUTC);

        // Adjust for cases where the approach time spans midnight UTC
        if (toTimeMinutes < fromTimeMinutes) {
            toTimeMinutes += 24 * 60; // Add a full day's worth of minutes
            if (localTimeMinutes < fromTimeMinutes) {
                localTimeMinutes += 24 * 60; // Adjust local time if it's after midnight UTC
            }
        }

        // Check if local time is within the approach time range
        return (
            localTimeMinutes >= fromTimeMinutes &&
            localTimeMinutes < toTimeMinutes
        );
    }

    private getCurrentTime(timezone: string): Date {
        return new Date(
            new Date().toLocaleString("en-US", { timeZone: timezone }),
        );
    }

    public async findNearbyMatches(
        userToBeApproached: User,
        enableEnableExtendedChecksForNotification = true,
    ): Promise<User[]> {
        // @dev Do not send notifications if user does not share her live location.
        if (
            !userToBeApproached ||
            !userToBeApproached.location ||
            userToBeApproached.dateMode !== EDateMode.LIVE
        ) {
            return [];
        }
        const lon = userToBeApproached.location.coordinates[0];
        const lat = userToBeApproached.location.coordinates[1];

        // @dev For HeatMap it's not of relevance whether user is within blacklisted region or approachTime rn.
        if (enableEnableExtendedChecksForNotification) {
            // @dev Check if user is within any of their blacklisted regions
            const isInBlacklistedRegion =
                (await this.blacklistedRegionRepository
                    .createQueryBuilder("region")
                    .where("region.user = :userId", {
                        userId: userToBeApproached.id,
                    })
                    .andWhere(
                        "ST_DWithin(region.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, region.radius)",
                        {
                            lon,
                            lat,
                        },
                    )
                    .getCount()) > 0;

            // @dev Do not send notifications if user is not in a safe space.
            if (isInBlacklistedRegion) {
                return [];
            }
            // @dev Do not send any notifications if user does not feel safe at this time (time zone sensitive).
            if (!this.isWithinApproachTime(userToBeApproached, lat, lon)) {
                return [];
            }
        }

        const userAge = getAge(userToBeApproached.birthDay);

        const potentialMatchesThatWantToApproach = this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect(
                "user.encounters",
                "encounter",
                "encounter.users @> ARRAY[:userToBeApproachedId]::uuid[]",
                { userToBeApproachedId: userToBeApproached.id },
            )
            .where("user.id != :userId", { userId: userToBeApproached.id })
            .andWhere("user.gender = :desiredGender", {
                desiredGender: userToBeApproached.genderDesire,
            })
            .andWhere("user.genderDesire = :userGender", {
                userGender: userToBeApproached.gender,
            })
            .andWhere(
                "(user.verificationStatus = :verificationStatusVerified)",
                {
                    verificationStatusVerified: EVerificationStatus.VERIFIED,
                },
            )
            .andWhere("user.dateMode = :liveMode", { liveMode: EDateMode.LIVE })
            .andWhere(
                "EXTRACT(YEAR FROM AGE(user.birthDay)) BETWEEN :minAge AND :maxAge",
                {
                    minAge: userAge - 15,
                    maxAge: userAge + 15,
                },
            )
            .andWhere(
                "(encounter.id IS NULL OR (encounter.lastDateTimePassedBy < :twentyFourHoursAgo AND encounter.status = :notMetStatus))",
                {
                    twentyFourHoursAgo: new Date(
                        Date.now() - 24 * 60 * 60 * 1000,
                    ),
                    notMetStatus: EEncounterStatus.NOT_MET,
                },
            );

        // @dev For HeatMap it's not of relevance if users are nearby rn, also we don't want to filter for approachChoice as also BE_APPROACHED users might want to see the heatmap
        if (enableEnableExtendedChecksForNotification) {
            potentialMatchesThatWantToApproach
                .andWhere(
                    "ST_DWithin(user.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distance)",
                    {
                        lon: userToBeApproached.location.coordinates[0],
                        lat: userToBeApproached.location.coordinates[1],
                        distance: 1500, // reachable within 1500m
                    },
                )
                .andWhere("user.approachChoice = :approach", {
                    approach: EApproachChoice.APPROACH,
                });
        }

        return potentialMatchesThatWantToApproach.getMany();
    }

    public async checkAndNotifyMatches(
        userToBeApproached: User,
    ): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(
            userToBeApproached,
            true,
        );

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
                true, // they are all nearby rn
                true, // reset older encounters
            );
        }
    }
}
