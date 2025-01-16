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
import { QueryRunner, Repository } from "typeorm";

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
            .leftJoinAndSelect("encounter.users", "allUsers")
            /** @DEV CHANGE! */
            .where(
                ':userId IN (SELECT "userId" FROM user_encounters_encounter WHERE "encounterId" = encounter.id)',
                { userId },
            )
            .andWhere("userReports.id IS NULL");

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
                {
                    startDate: dateRange.startDate,
                },
            );
        } else if (dateRange?.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy <= :endDate",
                {
                    endDate: dateRange.endDate,
                },
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
            const dto = encounter.convertToPublicDTO(user);

            // @dev Override general encounter status and return only the status from the user itself for the frontend.
            const userEncounterStatus = encounter.userStatuses[userId];
            if (userEncounterStatus) {
                dto.status = userEncounterStatus;
            } else {
                this.logger.error(
                    `Encounter status for user ${userId} not found! Returning general status.`,
                );
            }
            otherUserIds.push(dto.otherUser.id);
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
            encounter.isNearbyRightNow = nearbyUsers.has(encounter.otherUser.id)
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
     *
     * that are not supplied to this function will be set to isNearbyRightNow=false as they are e.g. not supplied by the matching service. */
    async saveEncountersForUser(
        userSendingLocationUpdate: User,
        userMatches: User[],
    ): Promise<Map<string, Encounter>> {
        const newEncounters: Map<string, Encounter> = new Map();
        const queryRunner =
            this.encounterRepository.manager.connection.createQueryRunner();

        try {
            let userEncounterCount = await this.findCreatedEncountersPerDay(
                userSendingLocationUpdate.id,
            );

            for (const userMatch of userMatches) {
                if (userEncounterCount >= MAX_ENCOUNTERS_PER_DAY_FOR_USER) {
                    this.logger.debug(
                        `User ${userSendingLocationUpdate.id} has reached the daily encounter limit`,
                    );
                    break;
                }

                const encounter = await this.findOrCreateEncounterWithLock(
                    userSendingLocationUpdate.id,
                    userMatch.id,
                    queryRunner,
                );

                if (encounter.status !== EEncounterStatus.MET_NOT_INTERESTED) {
                    newEncounters.set(userMatch.id, encounter);
                    userEncounterCount++;
                }
            }

            return newEncounters;
        } finally {
            await queryRunner.release();
        }
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

    private async findOrCreateEncounterWithLock(
        user1Id: string,
        user2Id: string,
        queryRunner: QueryRunner,
    ): Promise<Encounter> {
        await queryRunner.startTransaction();

        try {
            // Always lock users in a consistent order (by user ID) to prevent deadlocks
            const [smallerId, largerId] = [user1Id, user2Id].sort();

            // Lock users one at a time in consistent order
            const user1 = await queryRunner.manager
                .createQueryBuilder()
                .select("user")
                .from(User, "user")
                .where("user.id = :userId", { userId: smallerId })
                .setLock("pessimistic_write")
                .getOne();

            const user2 = await queryRunner.manager
                .createQueryBuilder()
                .select("user")
                .from(User, "user")
                .where("user.id = :userId", { userId: largerId })
                .setLock("pessimistic_write")
                .getOne();

            if (!user1 || !user2) {
                throw new NotFoundException("One or both users not found");
            }

            // Get encounters with these users
            const encounters = await queryRunner.manager
                .createQueryBuilder(Encounter, "encounter")
                .innerJoinAndSelect("encounter.users", "users")
                .where("users.id IN (:...userIds)", {
                    userIds: [smallerId, largerId],
                })
                .setLock("pessimistic_write")
                .getMany();

            // Find existing encounter with both users
            const existingEncounter = encounters.find((encounter) => {
                const userIds = new Set(encounter.users.map((u) => u.id));
                return userIds.has(smallerId) && userIds.has(largerId);
            });

            if (existingEncounter) {
                existingEncounter.lastDateTimePassedBy = new Date();
                existingEncounter.lastLocationPassedBy =
                    user1.id === user1Id ? user1.location : user2.location;
                existingEncounter.amountStreaks++;

                const savedEncounter = await queryRunner.manager.save(
                    Encounter,
                    existingEncounter,
                );
                await queryRunner.commitTransaction();
                return savedEncounter;
            }

            // Create new encounter
            const newEncounter = new Encounter();
            newEncounter.users = [user1, user2];
            newEncounter.lastDateTimePassedBy = new Date();
            newEncounter.lastLocationPassedBy =
                user1.id === user1Id ? user1.location : user2.location;
            newEncounter.setUserStatus(user1.id, EEncounterStatus.NOT_MET);
            newEncounter.setUserStatus(user2.id, EEncounterStatus.NOT_MET);

            const savedEncounter = await queryRunner.manager.save(
                Encounter,
                newEncounter,
            );
            await queryRunner.commitTransaction();
            return savedEncounter;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
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
