import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport } from './user-report.entity';
import { CreateUserReportDto } from '../DTOs/create-user-report.dto';

@Injectable()
export class UserReportService {
    constructor(
        @InjectRepository(UserReport)
        private userReportRepository: Repository<UserReport>,
    ) {}

    async create(createUserReportDto: CreateUserReportDto): Promise<UserReport> {
        const userReport = this.userReportRepository.create(createUserReportDto);
        return await this.userReportRepository.save(userReport);
    }

    async findAll(): Promise<UserReport[]> {
        return await this.userReportRepository.find();
    }

    async findOne(id: number): Promise<UserReport> {
        return await this.userReportRepository.findOne({ where: { id } });
    }
}