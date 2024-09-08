import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EVerificationStatus,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { find as findTimeZoneByLocation } from "geo-tz";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class MatchingService {
    private readonly logger = new Logger(MatchingService.name);

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
            this.logger.debug(
                `Not returning any nearbyMatches as user is not sharing his location right now: ${userToBeApproached.id} (dateMode: ${userToBeApproached.dateMode})`,
            );
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
                this.logger.debug(
                    `User ${userToBeApproached.id} is right now in blacklisted location - not returning potential matches.`,
                );
                return [];
            }
            // @dev Do not send any notifications if user does not feel safe at this time (time zone sensitive).
            if (!this.isWithinApproachTime(userToBeApproached, lat, lon)) {
                this.logger.debug(
                    `User ${userToBeApproached.id} does not feel safe to be approached right now.`,
                );
                return [];
            }
        }

        const userAge = getAge(userToBeApproached.birthDay);

        // TODO: This algorithm should be improved over time
        const potentialMatchesThatWantToApproach = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.encounters", "encounter")
            .leftJoin("encounter.users", "encounterUser")
            // @dev Exclude yourself
            .where("user.id != :userId", { userId: userToBeApproached.id })
            // @dev Only return users the approached user is interested in gender-wise
            .andWhere("user.gender = :desiredGender", {
                desiredGender: userToBeApproached.genderDesire,
            })
            // @dev Only return users that are interested in the user to be approached gender.
            .andWhere("user.genderDesire = :userGender", {
                userGender: userToBeApproached.gender,
            })
            // @dev Only send notifications to verified users
            .andWhere(
                "(user.verificationStatus = :verificationStatusVerified)",
                {
                    verificationStatusVerified: EVerificationStatus.VERIFIED,
                },
            )
            // @dev Only send notification to users who are sharing their live location right now.
            .andWhere("user.dateMode = :liveMode", { liveMode: EDateMode.LIVE })
            // @dev Are users within x meters - TODO: Make this configurable by users.
            // @dev Make sure users are somewhat within age range - TODO: Make this configurable by users.
            .andWhere(
                "EXTRACT(YEAR FROM AGE(user.birthDay)) BETWEEN :minAge AND :maxAge",
                {
                    minAge: userAge - 15,
                    maxAge: userAge + 15,
                },
            )
            // @dev filter out users that the user already had an encounter with in the last 24h and that both users have not set to "met, *" (do not resend notification)
            .andWhere(
                "(encounter.id IS NULL OR (encounter.lastDateTimePassedBy < :twentyFourHoursAgo AND encounter.status = :notMetStatus))",
                {
                    twentyFourHoursAgo: new Date(
                        Date.now() - 24 * 60 * 60 * 1000,
                    ),
                    notMetStatus: EEncounterStatus.NOT_MET,
                },
            )
            .andWhere(
                "(encounterUser.id = :userToBeApproachedId OR encounterUser.id IS NULL)",
                { userToBeApproachedId: userToBeApproached.id },
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
                // @dev Only send notification to users who want to approach.
                .andWhere("user.approachChoice = :approach", {
                    approach: EApproachChoice.APPROACH,
                });
        }

        this.logger.debug(
            `Returning potential matches for user ${userToBeApproached.id}`,
        );

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
