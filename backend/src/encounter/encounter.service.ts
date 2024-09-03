import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { User } from "@/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Encounter } from "./encounter.entity";

@Injectable()
export class EncounterService {
    constructor(
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
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
            const encounter = new Encounter();
            encounter.users = [userToBeApproached, u];
            encounter.lastDateTimePassedBy = new Date();
            encounter.lastLocationPassedBy = userToBeApproached.location;
            encounter.userReports = [];

            await this.encounterRepository.save(encounter);
        }
    }
}
