import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Encounter } from "./encounter.entity";

@Injectable()
export class EncounterService {
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

    async saveEncountersForUser(
        userToBeApproached: User,
        usersThatWantToApproach: User[],
    ) {
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

            await this.encounterRepository.save(encounter);
        }
    }

    async updateStatus(
        userId: string,
        updateStatusDTO: UpdateEncounterStatusDTO,
    ): Promise<Encounter> {
        const { encounterId, status } = updateStatusDTO;
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
