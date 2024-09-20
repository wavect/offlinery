import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserReportController } from "./user-report.controller";
import { UserReport } from "./user-report.entity";
import { UserReportService } from "./user-report.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserReport, User, Encounter])],
    providers: [UserReportService],
    controllers: [UserReportController],
    exports: [UserReportService],
})
export class UserReportModule {}
