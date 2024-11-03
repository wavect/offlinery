import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { GetLocationOfEncounterResponseDTO } from "@/DTOs/get-location-of-encounter-response.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { EEncounterStatus } from "@/types/user.types";
import { MAX_ENCOUNTERS_PER_DAY_FOR_USER } from "@/utils/misc.utils";
import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    PreconditionFailedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class EncounterService {
    private readonly logger = new Logger(EncounterService.name);

    constructor(
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {}

    async findEncountersByUser(
        userId: string,
        dateRange?: DateRangeDTO,
    ): Promise<Encounter[]> {
        let query = this.encounterRepository
            .createQueryBuilder("encounter")
            .innerJoinAndSelect("encounter.users", "user")
            .leftJoinAndSelect("encounter.userReports", "userReports")
            .leftJoinAndSelect("encounter.messages", "messages")
            .leftJoinAndSelect("messages.sender", "sender")
            /** @DEV CHANGE! */
            .where(
                ':userId IN (SELECT "userId" FROM user_encounters_encounter WHERE "encounterId" = encounter.id)',
                { userId },
            )
            .andWhere("userReports.id IS NULL")
            .leftJoinAndSelect("encounter.users", "allUsers");

        if (dateRange?.startDate && dateRange?.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy BETWEEN :startDate AND :endDate",
                {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                },
            );
        } else if (dateRange?.startDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy >= :startDate",
                { startDate: dateRange.startDate },
            );
        } else if (dateRange?.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy <= :endDate",
                { endDate: dateRange.endDate },
            );
        }

        // do not fail if none found
        return await query.getMany();
    }

    async getEncountersByUser(
        userId: string,
        startDate?: Date,
        endDate?: Date,
    ) {
        const [user, encounters] = await Promise.all([
            this.userService.findUserById(userId),
            this.findEncountersByUser(userId, {
                startDate,
                endDate,
            }),
        ]);

        if (!encounters?.length) {
            return [];
        }

        const otherUserIds = [];
        const userEncounters = encounters.map((encounter) => {
            const dto = encounter.convertToPublicDTO();
            const otherUser = dto.users.find((u) => u.id !== userId);
            otherUserIds.push(otherUser.id);
            return dto;
        });

        // Get nearby users and convert to Set for O(1) lookups
        const nearbyUsers = new Set(
            await this.userService.findUsersNearbyByUserIds(
                otherUserIds,
                user.location,
            ),
        );

        userEncounters.forEach((encounter) => {
            const otherUser = encounter.users.find((u) => u.id !== userId);
            encounter.isNearbyRightNow = nearbyUsers.has(otherUser.id)
                ? true
                : null;
        });

        this.logger.debug(
            `Found ${encounters.length} encounters for user ${userId}`,
        );

        return userEncounters;
    }

    /**
     * @param userSendingLocationUpdate
     * @param userMatches
     * @param resetNearbyStatusOfOtherEncounters If true all usersThatWantToApproach
     *
     * that are not supplied to this function will be set to isNearbyRightNow=false as they are e.g. not supplied by the matching service. */
    async saveEncountersForUser(
        userSendingLocationUpdate: User,
        userMatches: User[],
        resetNearbyStatusOfOtherEncounters: boolean,
    ): Promise<Map<string, Encounter>> {
        this.logger.debug(
            `Saving encounters for user ${userSendingLocationUpdate.id} with ${userMatches.length} users that want to approach. resetNearbyStatusOfOtherEncounters (${resetNearbyStatusOfOtherEncounters})`,
        );
        const newEncounters: Map<string, Encounter> = new Map();

        console.log(
            "got userMatches: ",
            userMatches.map((b) => b.id),
        );

        let userEncounterCount = await this.findCreatedEncountersPerDay(
            userSendingLocationUpdate.id,
        );

        for (const u of userMatches) {
            if (userEncounterCount >= MAX_ENCOUNTERS_PER_DAY_FOR_USER) {
                this.logger.debug(
                    `User ${userSendingLocationUpdate.id} has reached the daily encounter limit (${userEncounterCount}/${MAX_ENCOUNTERS_PER_DAY_FOR_USER}). Will not create encounter.`,
                );
                return;
            }
            // encounter should always be unique for a userId <> userId combination (not enforced on DB level as not possible)
            // @dev If encounter exists already, update the values, otherwise create new one.
            const existingEncounter =
                await this.findExistingEncounterBetweenTwoUsers(
                    userSendingLocationUpdate.id,
                    u.id,
                );

            let encounter: Encounter;

            if (existingEncounter) {
                console.log(
                    "Reusing existing encounter with ID:",
                    existingEncounter.id,
                );
                encounter = existingEncounter;
            } else {
                console.log("Creating new encounter");
                encounter = new Encounter();
            }

            // @dev Still sending new notifications if encounter status is MET_INTERESTED (because why not, multiple times to meet)
            if (encounter.status === EEncounterStatus.MET_NOT_INTERESTED) {
                newEncounters.set(
                    u.id,
                    await this.encounterRepository.save(encounter),
                );
                this.logger.debug(
                    `Skipping encounter update for users ${u.id} and ${userSendingLocationUpdate.id} as encounterStatus is "MET_NOT_INTERESTED".`,
                );
                continue;
            }

            encounter.users = [userSendingLocationUpdate, u];
            encounter.lastDateTimePassedBy = new Date();
            encounter.lastLocationPassedBy = userSendingLocationUpdate.location;
            encounter.setUserStatus(
                userSendingLocationUpdate.id,
                EEncounterStatus.NOT_MET,
            );
            encounter.setUserStatus(u.id, EEncounterStatus.NOT_MET);
            encounter.createdAt = new Date();
            const persistedEncounter =
                await this.encounterRepository.save(encounter);

            newEncounters.set(u.id, persistedEncounter);

            this.logger.debug(
                `Created new/Updated encounter for ${u.id} and ${userSendingLocationUpdate.id}.`,
            );
        }

        userEncounterCount++;

        return newEncounters;
    }

    async updateStatus(
        userId: string,
        updateStatusDTO: UpdateEncounterStatusDTO,
    ): Promise<Encounter> {
        const { encounterId, status } = updateStatusDTO;
        this.logger.debug(
            `User ${userId} is updating the encounterStatus of ${encounterId} to ${status}`,
        );

        const encounter = await this.encounterRepository.findOneBy({
            id: encounterId,
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        encounter.setUserStatus(userId, status);
        return this.encounterRepository.save(encounter);
    }

    async getLocationOfEncounter(
        userId: string,
        encounterId: string,
    ): Promise<GetLocationOfEncounterResponseDTO> {
        this.logger.debug(
            `User ${userId} trying to access location for encounterId ${encounterId}`,
        );
        const encounter: Encounter = await this.encounterRepository.findOne({
            where: { id: encounterId },
            relations: ["users"],
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        const currentUser = encounter.users.find((u) => u.id === userId);
        const otherUser = encounter.users.find((u) => u.id !== userId);
        if (!otherUser) {
            throw new NotFoundException(
                `Other user of Encounter ${encounterId} not found! Requesting user: ${userId}`,
            );
        }
        if (!otherUser.location) {
            throw new PreconditionFailedException(
                `Other user of Encounter ${encounterId} has not location: ${otherUser.location}`,
            );
        }

        // final check, is user really nearby?
        const res = await this.userService.findUsersNearbyByUserIds(
            [otherUser.id],
            currentUser.location,
        );

        if (!res.includes(otherUser.id)) {
            throw new PreconditionFailedException(
                `Other user of Encounter ${encounterId} is not nearby right now.`,
            );
        }

        return {
            lastTimeLocationUpdated: otherUser.locationLastTimeUpdated,
            longitude: otherUser.location.coordinates[0],
            latitude: otherUser.location.coordinates[1],
        };
    }

    async pushMessage(
        userId: string,
        pushMessageDTO: PushMessageDTO,
    ): Promise<Encounter> {
        const { encounterId, content } = pushMessageDTO;
        this.logger.debug(
            `User ${userId} just wrote a message with encounterId ${encounterId}`,
        );

        const encounter = await this.encounterRepository.findOne({
            where: { id: encounterId },
            relations: { messages: { sender: true } },
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        encounter.messages = encounter.messages.filter(
            (m) => m.sender.id !== userId,
        );

        const newMessage = this.messageRepository.create({
            content,
            sentAt: new Date(),
            sender: { id: userId },
            encounter,
        });

        await this.messageRepository.save(newMessage);
        encounter.messages.push(newMessage);
        return await this.encounterRepository.save(encounter);
    }

    /**
     * verify that a current encounter between two users really exists, considering both cases
     * [user1, user2] or [user2, user1]
     * @param user1Id
     * @param user2Id
     * @private
     */
    private async findExistingEncounterBetweenTwoUsers(
        user1Id: string,
        user2Id: string,
    ) {
        return await this.encounterRepository
            .createQueryBuilder("encounter")
            .innerJoinAndSelect("encounter.users", "users")
            .where("users.id IN (:...userIds)", { userIds: [user1Id, user2Id] })
            .groupBy("encounter.id, users.id") // Added users.id to GROUP BY
            .having("COUNT(DISTINCT users.id) = 2")
            .getOne();
    }

    private async findCreatedEncountersPerDay(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const encounterCount = await this.userRepository
            .createQueryBuilder("user")
            .innerJoin("user.encounters", "encounter")
            .where("user.id = :userId", { userId })
            .andWhere("encounter.lastDateTimePassedBy >= :today", { today })
            .andWhere("encounter.lastDateTimePassedBy < :tomorrow", {
                tomorrow,
            })
            .groupBy("user.id")
            .select("COUNT(encounter.id)", "count")
            .getRawOne();

        const count = parseInt(encounterCount?.count || "0");

        this.logger.log(`User ${userId} has created ${count} encounters today`);

        return count;
    }
}
