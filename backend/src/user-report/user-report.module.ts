import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UserReportController } from "./user-report.controller";
import { UserReport } from "./user-report.entity";
import { UserReportService } from "./user-report.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserReport, User])],
    providers: [UserReportService],
    controllers: [UserReportController],
    exports: [UserReportService],
})
export class UserReportModule {}
