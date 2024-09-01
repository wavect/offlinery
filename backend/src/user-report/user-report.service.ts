import { CreateUserReportDTO } from "@/DTOs/create-user-report.dto";
import { User } from "@/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserReport } from "./user-report.entity";

@Injectable()
export class UserReportService {
    constructor(
        @InjectRepository(UserReport)
        private userReportRepository: Repository<UserReport>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(
        reportingUserId: string,
        createUserReportDto: CreateUserReportDTO,
    ): Promise<UserReport> {
        const reportingUser = await this.userRepository.findOneBy({
            id: reportingUserId,
        });
        const reportedUser = await this.userRepository.findOneBy({
            id: createUserReportDto.reportedUserId,
        });

        if (!reportingUser || !reportedUser) {
            throw new Error("Reporting user or reported user not found");
        }

        const userReport = this.userReportRepository.create({
            ...createUserReportDto,
            reportingUser,
            reportedUser,
        });

        return await this.userReportRepository.save(userReport);
    }
}
