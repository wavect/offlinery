import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EGender,
    EIntention,
    EVerificationStatus,
} from "@/types/user.types";
import { getAgeRangeParsed } from "@/utils/misc.utils";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { find as findTimeZoneByLocation } from "geo-tz";
import { Point } from "geojson";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserRepository extends Repository<User> {
    private queryBuilder: SelectQueryBuilder<User>;
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        private dataSource: DataSource,
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>,
    ) {
        super(User, dataSource.createEntityManager());
    }

    public findUserMatchBaseQuery(userToBeApproached: User): this {
        this.queryBuilder = this.createQueryBuilder("user");
        this.addEncounterJoins()
            .withRecentLocationsOnly()
            .excludeUser(userToBeApproached.id)
            .withNotInBlacklistedRegion()
            .withDesiredGender(userToBeApproached.genderDesire)
            .withGenderDesire(userToBeApproached.gender)
            .withIntentions(userToBeApproached.intentions)
            .withinAgeRange(
                getAgeRangeParsed(userToBeApproached.ageRangeString),
            )
            .filterNotInterested()
            .ifEncounterOnlyShowMine(userToBeApproached.id)
            .filterRecentEncounters()
            .withDateModeLiveMode();

        return this;
    }

    /** @DEV helpful for debugging, returns the raw query with parameters */
    public getSqlQuery() {
        return this.queryBuilder.getQueryAndParameters();
    }

    /** @returns {key: encounterId, value: User}[]*/
    async getPotentialMatchesForNotifications(
        userSendingLocationUpdate: User,
    ): Promise<User[]> {
        if (!userSendingLocationUpdate.location) {
            this.logger.error(
                `No location found for user ${userSendingLocationUpdate.id}: ${userSendingLocationUpdate.location}`,
            );
            return [];
        }
        const [lon, lat] = userSendingLocationUpdate.location.coordinates;
        const isInBlacklistedRegion = await this.isUserInBlacklistedRegion(
            userSendingLocationUpdate,
            lon,
            lat,
        );

        if (isInBlacklistedRegion) {
            this.logger.debug(
                `User ${userSendingLocationUpdate.id} is right now in blacklisted location - not returning potential matches.`,
            );
            return [];
        }

        if (!this.isWithinApproachTime(userSendingLocationUpdate, lat, lon)) {
            this.logger.debug(
                `User ${userSendingLocationUpdate.id} does not feel safe to be approached right now or does not want to approach right now.`,
            );
            return [];
        }

        return this.getPotentialMatches(userSendingLocationUpdate);
    }

    async getPotentialMatchesForHeatMap(
        userToBeApproached: User,
    ): Promise<User[]> {
        return this.findUserMatchBaseQuery(userToBeApproached).getMany();
    }

    async getPotentialMatches(
        userSendingLocationUpdate: User,
    ): Promise<User[]> {
        return await this.findUserMatchBaseQuery(userSendingLocationUpdate)
            /** @dev TODO: Make this configurable by users. */
            .withinDistance(userSendingLocationUpdate.location, 1500)
            .userWithSuitableApproachSettings(
                userSendingLocationUpdate.approachChoice,
            )
            .limit(3) // @dev we don't want to overload both users with matches
            .getMany();
    }

    private addEncounterJoins(): this {
        this.queryBuilder
            .leftJoinAndSelect("user.encounters", "encounter")
            .leftJoin("encounter.users", "encounterUser");
        return this;
    }

    /** Chaining Methods */

    private withinDistance(userLocation: Point, distance: number): this {
        if (
            !userLocation ||
            !userLocation.coordinates ||
            userLocation.coordinates.length !== 2
        ) {
            this.logger.warn("Invalid user location provided");
            return this;
        }

        const [lon, lat] = userLocation.coordinates;

        try {
            this.queryBuilder.andWhere(
                `ST_DWithin(
                ST_MakePoint(:lon, :lat)::geography,
                "user"."location"::geography,
                :distance
            )`,
                { lon, lat, distance },
            );
        } catch (error) {
            this.logger.error("Error in withinDistance query:", error);
        }

        return this;
    }

    private withDateModeLiveMode(): this {
        this.queryBuilder.andWhere("user.dateMode = :liveMode", {
            liveMode: EDateMode.LIVE,
        });
        return this;
    }

    private withVerificationStatusVerified(): this {
        this.queryBuilder.andWhere(
            "(user.verificationStatus = :verificationStatusVerified)",
            {
                verificationStatusVerified: EVerificationStatus.VERIFIED,
            },
        );
        return this;
    }

    private excludeUser(userId: string): this {
        this.queryBuilder.andWhere("user.id != :userId", { userId });
        return this;
    }

    private withNotInBlacklistedRegion(): this {
        this.queryBuilder.andWhere(`
            NOT EXISTS (
                SELECT 1
                FROM blacklisted_region br
                WHERE br."userId" = "user"."id"
                AND ST_DWithin(
                    "user"."location"::geography,
                    br."location"::geography,
                    br."radius"
                )
            )
        `);

        return this;
    }

    private withRecentLocationsOnly(): this {
        const h24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.queryBuilder.andWhere(
            `
                user.locationLastTimeUpdated IS NOT NULL 
                AND user.locationLastTimeUpdated >= :h24HoursAgo
            `,
            { h24HoursAgo },
        );
        return this;
    }

    private withDesiredGender(desiredGenders: EGender[]): this {
        this.queryBuilder.andWhere("user.gender IN (:...desiredGenders)", {
            desiredGenders,
        });
        return this;
    }

    private withGenderDesire(userGender: EGender): this {
        this.queryBuilder.andWhere(":userGender = ANY(user.genderDesire)", {
            userGender,
        });
        return this;
    }

    private withIntentions(intentions: EIntention[]): this {
        this.queryBuilder.andWhere("user.intentions && :intentions", {
            intentions,
        });
        return this;
    }

    private withinAgeRange(ageRange: number[]): this {
        if (ageRange.length !== 2) {
            return this;
        }

        const [minAge, maxAge] = ageRange;
        this.queryBuilder.andWhere(
            "EXTRACT(YEAR FROM AGE(user.birthDay)) >= :minAge AND EXTRACT(YEAR FROM AGE(user.birthDay)) <= :maxAge",
            { minAge, maxAge },
        );

        return this;
    }

    private filterNotInterested(): this {
        this.queryBuilder.andWhere(
            "(encounter.id IS NULL OR encounter.status != :notInterestedStatus)",
            {
                notInterestedStatus: EEncounterStatus.MET_NOT_INTERESTED,
            },
        );
        return this;
    }

    private filterRecentEncounters(): this {
        this.queryBuilder.andWhere(
            "(encounter.id IS NULL OR encounter.lastDateTimePassedBy < :twentyFourHoursAgo)",
            {
                twentyFourHoursAgo: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
        );
        return this;
    }

    private ifEncounterOnlyShowMine(userToBeApproachedId: string): this {
        this.queryBuilder.andWhere(
            "(encounter.id IS NULL OR encounterUser.id = :userToBeApproachedId)",
            { userToBeApproachedId },
        );
        return this;
    }

    private userWithSuitableApproachSettings(
        approachChoice: EApproachChoice,
    ): this {
        if (
            approachChoice === EApproachChoice.APPROACH ||
            approachChoice === EApproachChoice.BOTH
        ) {
            this.queryBuilder.andWhere(
                '("user"."approachChoice" = :bothChoice OR "user"."approachChoice" = :beApproachedChoice)',
                {
                    bothChoice: EApproachChoice.BOTH,
                    beApproachedChoice: EApproachChoice.BE_APPROACHED,
                },
            );
        } else {
            this.queryBuilder.andWhere(
                '("user"."approachChoice" = :bothChoice OR "user"."approachChoice" = :approachChoice)',
                {
                    bothChoice: EApproachChoice.BOTH,
                    approachChoice: EApproachChoice.APPROACH,
                },
            );
        }

        return this;
    }

    private limit(amount: number): this {
        this.queryBuilder.limit(amount);
        return this;
    }

    private getMany(): Promise<User[]> {
        return this.queryBuilder.getMany();
    }

    private getAge(birthDay: Date): number {
        const today = new Date();
        let age = today.getFullYear() - birthDay.getFullYear();
        const m = today.getMonth() - birthDay.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDay.getDate())) {
            age--;
        }
        return age;
    }

    private isWithinApproachTime(
        user: User,
        lat: number,
        lon: number,
    ): boolean {
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

    private async isUserInBlacklistedRegion(
        user: User,
        lon: number,
        lat: number,
    ): Promise<boolean> {
        const count = await this.blacklistedRegionRepository
            .createQueryBuilder("region")
            .where("region.user = :userId", { userId: user.id })
            .andWhere(
                "ST_DWithin(region.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, region.radius)",
                { lon, lat },
            )
            .getCount();

        return count > 0;
    }

    private getCurrentTime(timezone: string): Date {
        return new Date(
            new Date().toLocaleString("en-US", { timeZone: timezone }),
        );
    }
}
