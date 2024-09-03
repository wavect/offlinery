import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { I18nTranslations } from "@/translations/i18n.generated";
import { EDateMode } from "@/types/user.types";
import { User } from "@/user/user.entity";
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
    ) {}

    private isWithinApproachTime(
        user: User,
        lat: number,
        lon: number,
    ): boolean {
        const timezoneOfUserLocation = findTimeZoneByLocation(lat, lon);
        const currentTime = new Date().toLocaleString("en-US", {
            timeZone: timezoneOfUserLocation[0],
        });
        const localTime = new Date(currentTime);

        const approachFromTime = new Date(user.approachFromTime);
        const approachToTime = new Date(user.approachToTime);

        // Set the date of approachFromTime and approachToTime to today
        approachFromTime.setFullYear(
            localTime.getFullYear(),
            localTime.getMonth(),
            localTime.getDate(),
        );
        approachToTime.setFullYear(
            localTime.getFullYear(),
            localTime.getMonth(),
            localTime.getDate(),
        );

        // Handle case where approachToTime is on the next day
        if (approachToTime < approachFromTime) {
            approachToTime.setDate(approachToTime.getDate() + 1);
        }

        // Check if current time is within the approach time range
        return localTime >= approachFromTime && localTime <= approachToTime;
    }

    private async findNearbyMatches(user: User): Promise<User[]> {
        if (!user || !user.location || user.dateMode !== EDateMode.LIVE) {
            return [];
        }
        const lon = user.location.coordinates[0];
        const lat = user.location.coordinates[1];

        // Check if user is within any of their blacklisted regions
        const isInBlacklistedRegion =
            (await this.blacklistedRegionRepository
                .createQueryBuilder("region")
                .where("region.user = :userId", { userId: user.id })
                .andWhere(
                    "ST_DWithin(region.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, region.radius)",
                    {
                        lon,
                        lat,
                    },
                )
                .getCount()) > 0;

        if (isInBlacklistedRegion) {
            return [];
        }
        if (!this.isWithinApproachTime(user, lat, lon)) {
            return [];
        }

        const userAge = getAge(user.birthDay);

        // TODO: This algorithm should be improved over time (e.g. age, etc. based on user settings, attractivity etc.)
        // TODO: age, distance, etc. should be configurable over time
        const nearbyUsers = await this.userRepository
            .createQueryBuilder("user")
            .where("user.id != :userId", { userId: user.id })
            .andWhere("user.gender = :desiredGender", {
                desiredGender: user.genderDesire,
            })
            .andWhere("user.genderDesire = :userGender", {
                userGender: user.gender,
            })
            .andWhere("user.dateMode = :liveMode", { liveMode: EDateMode.LIVE })
            .andWhere(
                "ST_DWithin(user.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :distance)",
                {
                    lon: user.location.coordinates[0],
                    lat: user.location.coordinates[1],
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

        return nearbyUsers;
    }

    async checkAndNotifyMatches(user: User): Promise<void> {
        const nearbyMatches = await this.findNearbyMatches(user);

        if (nearbyMatches.length > 0) {
            const notification: OfflineryNotification = {
                to: user.pushToken,
                sound: "default",
                title: this.i18n.t("main.notification.newMatch.title", {
                    args: { firstName: user.firstName },
                }),
                body: this.i18n.t("main.notification.newMatch.body"),
                data: {
                    screen: EAppScreens.NAVIGATE_TO_APPROACH,
                    navigateToPerson: user.convertToPublicDTO(),
                },
            };

            await this.notificationService.sendPushNotification(
                user.pushToken,
                [notification],
            );
        }
    }
}
