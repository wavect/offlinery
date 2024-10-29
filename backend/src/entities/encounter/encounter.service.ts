import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { GetLocationOfEncounterResponseDTO } from "@/DTOs/get-location-of-encounter-response.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { EEncounterStatus } from "@/types/user.types";
import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    PreconditionFailedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Encounter } from "./encounter.entity";

@Injectable()
export class EncounterService {
    private readonly logger = new Logger(EncounterService.name);

    constructor(
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
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

        if (dateRange.startDate && dateRange.endDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy BETWEEN :startDate AND :endDate",
                {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                },
            );
        } else if (dateRange.startDate) {
            query = query.andWhere(
                "encounter.lastDateTimePassedBy >= :startDate",
                { startDate: dateRange.startDate },
            );
        } else if (dateRange.endDate) {
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
            encounter.isNearbyRightNow = nearbyUsers.has(otherUser.id);
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
        areNearbyRightNow: boolean,
        resetNearbyStatusOfOtherEncounters: boolean,
    ): Promise<Map<string, Encounter>> {
        this.logger.debug(
            `Saving encounters for user ${userSendingLocationUpdate.id} with ${userMatches.length} users that want to approach. areNearbyRightNow (${areNearbyRightNow}), resetNearbyStatusOfOtherEncounters (${resetNearbyStatusOfOtherEncounters})`,
        );
        const newEncounters: Map<string, Encounter> = new Map();
        for (const u of userMatches) {
            // encounter should always be unique for a userId <> userId combination (not enforced on DB level as not possible)
            // @dev If encounter exists already, update the values, otherwise create new one.
            const encounter: Encounter =
                (await this.encounterRepository.findOne({
                    relations: ["users"],
                    where: {
                        users: { id: In([userSendingLocationUpdate.id, u.id]) },
                    },
                })) ?? new Encounter();

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

            newEncounters.set(
                u.id,
                await this.encounterRepository.save(encounter),
            );
            this.logger.debug(
                `Created new/Updated encounter for ${u.id} and ${userSendingLocationUpdate.id}.`,
            );
        }

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
        const otherUser = encounter.users.find((u) => u.id != userId);
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
}
