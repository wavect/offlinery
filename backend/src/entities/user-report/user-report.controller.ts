import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { CreateUserReportDTO } from "@/DTOs/create-user-report.dto";
import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserReport } from "./user-report.entity";
import { UserReportService } from "./user-report.service";

@ApiTags("user-reports")
@Controller({
    path: "user-reports",
    version: "1",
})
export class UserReportController {
    constructor(private readonly userReportService: UserReportService) {}

    @Post(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiParam({
        name: USER_ID_PARAM,
        type: "string",
        description: "Reporting User ID",
    })
    @ApiOperation({ summary: "Create a new user report" })
    @ApiResponse({
        status: 201,
        description: "The report has been successfully created.",
        type: UserReport,
    })
    async create(
        @Param(USER_ID_PARAM) reportingUserId: string,
        @Body() createUserReportDTO: CreateUserReportDTO,
    ): Promise<UserReport> {
        return this.userReportService.create(
            reportingUserId,
            createUserReportDTO,
        );
    }
}
