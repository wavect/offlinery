import { CreateUserReportDTO } from "@/DTOs/create-user-report.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserReport } from "./user-report.entity";

@Injectable()
export class UserReportService {
    private readonly logger = new Logger(UserReportService.name);

    constructor(
        @InjectRepository(UserReport)
        private userReportRepository: Repository<UserReport>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Encounter)
        private encounterRepository: Repository<Encounter>,
    ) {}

    async create(
        reportingUserId: string,
        createUserReportDto: CreateUserReportDTO,
    ): Promise<boolean> {
        this.logger.debug(
            `User ${reportingUserId} has reported ${createUserReportDto.encounterId} encounter for ${createUserReportDto.incidentType}`,
        );
        const reportingUser = await this.userRepository.findOneBy({
            id: reportingUserId,
        });

        const encounter = await this.encounterRepository.findOne({
            relations: ["users"],
            where: {
                id: createUserReportDto.encounterId,
            },
        });

        /** @DEV - TODO the current architecture allows for more than two entries within one encounter */
        const userToBeReported = encounter?.users.find(
            (user) => user.id !== reportingUserId,
        );

        if (!userToBeReported) {
            throw new Error("Reporting user or reported user not found");
        }

        const userReport = this.userReportRepository.create({
            ...createUserReportDto,
            reportingUser,
            reportedUser: userToBeReported,
            reportedEncounter: encounter,
        });

        return !!(await this.userReportRepository.save(userReport));
    }
}
