import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserReportService } from './user-report.service';
import { CreateUserReportDTO } from '../DTOs/create-user-report.dto';
import { UserReport } from './user-report.entity';

@ApiTags('user-reports')
@Controller({
    path: 'user-reports',
    version: '1',
})
export class UserReportController {
    constructor(private readonly userReportService: UserReportService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user report' })
    @ApiResponse({ status: 201, description: 'The report has been successfully created.', type: UserReport })
    async create(@Body() createUserReportDto: CreateUserReportDTO): Promise<UserReport> {
        return this.userReportService.create(createUserReportDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user reports' })
    @ApiResponse({ status: 200, description: 'Return all user reports.', type: [UserReport] })
    async findAll(): Promise<UserReport[]> {
        return this.userReportService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user report by id' })
    @ApiResponse({ status: 200, description: 'Return the user report.', type: UserReport })
    @ApiResponse({ status: 404, description: 'User report not found.' })
    async findOne(@Param('id') id: string): Promise<UserReport> {
        return this.userReportService.findOne(+id);
    }
}