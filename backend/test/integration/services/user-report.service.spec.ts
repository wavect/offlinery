import { CreateUserReportDTO } from "@/DTOs/create-user-report.dto";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserReportService } from "@/entities/user-report/user-report.service";
import { EIncidentType } from "@/types/user.types";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("UserReportService Integration Test", () => {
    let userReportService: UserReportService;
    let userReportRepository: Repository<UserReport>;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let testingDataSource: DataSource;
    let testingModule;

    beforeEach(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;
        userReportService = module.get<UserReportService>(UserReportService);
        userReportRepository = module.get<Repository<UserReport>>(
            getRepositoryToken(UserReport),
        );
        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
    });

    describe("create", () => {
        it("should create a user report", async () => {
            const reportingUser = await userFactory.persistTestUser();
            const reportedUser = await userFactory.persistTestUser();
            const encounter = await encounterFactory.persistTestEncounter(
                reportingUser,
                reportedUser,
            );

            const createUserReportDto: CreateUserReportDTO = {
                incidentDescription: "Inappropriate behavior",
                incidentType: EIncidentType.Disrespectful,
                encounterId: encounter.id,
                keepReporterInTheLoop: true,
            };

            const result = await userReportService.create(
                reportingUser.id,
                createUserReportDto,
            );
            expect(result).toBe(true);

            const savedReport = await userReportRepository.findOne({
                where: { reportingUser: { id: reportingUser.id } },
                relations: [
                    "reportingUser",
                    "reportedUser",
                    "reportedEncounter",
                ],
            });

            expect(savedReport).toBeDefined();
            expect(savedReport.reportingUser.id).toBe(reportingUser.id);
            expect(savedReport.reportedUser.id).toBe(reportedUser.id);
            expect(savedReport.reportedEncounter.id).toBe(encounter.id);
            expect(savedReport.incidentDescription).toBe(
                createUserReportDto.incidentDescription,
            );
        });
    });
});
