import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EVerificationStatus,
} from "@/types/user.types";
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

    private createUserMatchBaseQuery(userToBeApproached: User): this {
        this.queryBuilder = this.createQueryBuilder("user");
        this.addEncounterJoins()
            .excludeUser(userToBeApproached.id)
            .withDesiredGender(userToBeApproached.genderDesire)
            .withGenderDesire(userToBeApproached.gender)
            .withVerificationStatusVerified()
            .withinAgeRange(this.getAge(new Date(userToBeApproached.birthDay)))
            .filterRecentEncounters()
            .relatedToUser(userToBeApproached.id)
            .withDateModeLiveMode();

        return this;
    }

    /** @returns {key: encounterId, value: User}[]*/
    async getPotentialMatchesForNotifications(
        userToBeApproached: User,
    ): Promise<User[]> {
        const [lon, lat] = userToBeApproached.location.coordinates;
        const isInBlacklistedRegion = await this.isUserInBlacklistedRegion(
            userToBeApproached,
            lon,
            lat,
        );

        if (isInBlacklistedRegion) {
            this.logger.debug(
                `User ${userToBeApproached.id} is right now in blacklisted location - not returning potential matches.`,
            );
            return [];
        }

        if (!this.isWithinApproachTime(userToBeApproached, lat, lon)) {
            this.logger.debug(
                `User ${userToBeApproached.id} does not feel safe to be approached right now.`,
            );
            return [];
        }

        return this.getPotentialMatches(userToBeApproached);
    }

    async getPotentialMatchesForHeatMap(
        userToBeApproached: User,
    ): Promise<User[]> {
        return this.createUserMatchBaseQuery(userToBeApproached).getMany();
    }

    async getPotentialMatches(userToBeApproached: User): Promise<User[]> {
        return await this.createUserMatchBaseQuery(userToBeApproached)
            /** @dev Are users within x meters - TODO: Make this configurable by users. */
            .withinDistance(userToBeApproached.location, 1500)
            .withUserWantingToBeApproached()
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

    private withDesiredGender(desiredGender: string): this {
        this.queryBuilder.andWhere("user.gender = :desiredGender", {
            desiredGender,
        });
        return this;
    }

    private withGenderDesire(userGender: string): this {
        this.queryBuilder.andWhere("user.genderDesire = :userGender", {
            userGender,
        });
        return this;
    }

    /** @DEV TODO make range of users configurable */
    private withinAgeRange(userAge: number, range: number = 7): this {
        this.queryBuilder.andWhere(
            "EXTRACT(YEAR FROM AGE(user.birthDay)) BETWEEN :minAge AND :maxAge",
            { minAge: userAge - range, maxAge: userAge + range },
        );
        return this;
    }

    private filterRecentEncounters(): this {
        this.queryBuilder.andWhere(
            "(encounter.id IS NULL OR (encounter.lastDateTimePassedBy < :twentyFourHoursAgo AND encounter.status = :notMetStatus))",
            {
                twentyFourHoursAgo: new Date(Date.now() - 24 * 60 * 60 * 1000),
                notMetStatus: EEncounterStatus.NOT_MET,
            },
        );
        return this;
    }

    private relatedToUser(userToBeApproachedId: string): this {
        this.queryBuilder.andWhere(
            "(encounterUser.id = :userToBeApproachedId OR encounterUser.id IS NULL)",
            { userToBeApproachedId },
        );
        return this;
    }

    private withUserWantingToBeApproached(): this {
        this.queryBuilder.andWhere(
            '("user"."approachChoice" = :bothChoice OR "user"."approachChoice" = :beApproachedChoice)',
            {
                bothChoice: EApproachChoice.BOTH,
                beApproachedChoice: EApproachChoice.BE_APPROACHED,
            },
        );

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
