import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
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
    ) {}

    async findEncountersByUser(
        userId: string,
        dateRange: DateRangeDTO,
    ): Promise<Encounter[]> {
        let query = this.encounterRepository
            .createQueryBuilder("encounter")
            .leftJoinAndSelect("encounter.users", "user")
            .where("user.id = :userId", { userId });

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

    /**
     * @param userToBeApproached
     * @param usersThatWantToApproach
     * @param areNearbyRightNow All encounters will be set to this value - isNearbyRightNow
     * @param resetNearbyStatusOfOtherEncounters If true all usersThatWantToApproach
     *     that are not supplied to this function will be set to isNearbyRightNow=false as they are e.g. not supplied by the matching service.
     * that are not supplied to this function will be set to isNearbyRightNow=false as they are e.g. not supplied by the matching service. */
    async saveEncountersForUser(
        userToBeApproached: User,
        usersThatWantToApproach: User[],
        areNearbyRightNow: boolean,
        resetNearbyStatusOfOtherEncounters: boolean,
    ) {
        this.logger.debug(
            `Saving encounters for user ${userToBeApproached.id} with ${usersThatWantToApproach.length} users that want to approach. areNearbyRightNow (${areNearbyRightNow}), resetNearbyStatusOfOtherEncounters (${resetNearbyStatusOfOtherEncounters})`,
        );
        for (const u of usersThatWantToApproach) {
            // encounter should always be unique for a userId <> userId combination (not enforced on DB level as not possible)
            // @dev If encounter exists already, update the values, otherwise create new one.
            const encounter: Encounter =
                (await this.encounterRepository.findOne({
                    relations: ["users"],
                    where: {
                        users: { id: In([userToBeApproached.id, u.id]) },
                    },
                })) ?? new Encounter();

            encounter.users = [userToBeApproached, u];
            encounter.lastDateTimePassedBy = new Date();
            encounter.lastLocationPassedBy = userToBeApproached.location;
            encounter.isNearbyRightNow = areNearbyRightNow;

            await this.encounterRepository.save(encounter);
        }

        if (resetNearbyStatusOfOtherEncounters) {
            // @dev We need to set older encounters to isNearbyRightNow false to hide the navigate button on the frontend, etc.
            const usersThatWantToApproachIds = usersThatWantToApproach.map(
                (u) => u.id,
            );

            await this.encounterRepository
                .createQueryBuilder("encounter")
                .innerJoin(
                    "encounter.users",
                    "user",
                    "user.id = :userToBeApproachedId",
                    { userToBeApproachedId: userToBeApproached.id },
                )
                .leftJoin(
                    "encounter.users",
                    "otherUser",
                    "otherUser.id != :userToBeApproachedId",
                    { userToBeApproachedId: userToBeApproached.id },
                )
                .where("otherUser.id NOT IN (:...usersThatWantToApproachIds)", {
                    usersThatWantToApproachIds,
                })
                .andWhere("encounter.isNearbyRightNow = :isNearby", {
                    isNearby: true,
                })
                .update()
                .set({ isNearbyRightNow: false })
                .execute();

            this.logger.debug(`Resetted nearbyStatus of other encounters.`);
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

        encounter.userStatuses[userId] = status;
        return this.encounterRepository.save(encounter);
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
            relations: { messages: true },
        });
        if (!encounter) {
            throw new NotFoundException(
                `Encounter with ID ${encounterId} not found`,
            );
        }

        const newMessage = this.messageRepository.create({
            content,
            sentAt: new Date(),
            sender: { id: userId },
            encounter,
        });

        await this.messageRepository.save(newMessage);
        encounter.messages.push(newMessage);
        return this.encounterRepository.save(encounter);
    }
}
