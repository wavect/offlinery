import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReport } from './user-report.entity';
import { UserReportService } from './user-report.service';
import { UserReportController } from './user-report.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserReport])],
    providers: [UserReportService],
    controllers: [UserReportController],
    exports: [UserReportService],
})
export class UserReportModule {}