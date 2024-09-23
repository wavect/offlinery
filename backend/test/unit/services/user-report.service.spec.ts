import { CreateUserReportDTO } from "@/DTOs/create-user-report.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserReportService } from "@/entities/user-report/user-report.service";
import { User } from "@/entities/user/user.entity";
import { EIncidentType } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { mockRepository } from "../../_src/utils/utils";

describe("UserReportService", () => {
    let service: UserReportService;
    let userReportRepository: Repository<UserReport>;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserReportService,
                {
                    provide: getRepositoryToken(UserReport),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Encounter),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UserReportService>(UserReportService);
        userReportRepository = module.get(getRepositoryToken(UserReport));
        userRepository = module.get(getRepositoryToken(User));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it.skip("should create a new user report", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                encounterId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            const reportingUser = { id: reportingUserId } as User;
            const reportedUser = {
                id: createUserReportDto.encounterId,
            } as User;

            jest.spyOn(userRepository, "findOneBy")
                .mockResolvedValueOnce(reportingUser)
                .mockResolvedValueOnce(reportedUser);

            const createdUserReport = {
                ...createUserReportDto,
                reportingUser,
                reportedUser,
            } as any as UserReport;

            jest.spyOn(userReportRepository, "create").mockReturnValue(
                createdUserReport,
            );
            jest.spyOn(userReportRepository, "save").mockResolvedValue(
                createdUserReport,
            );

            const result = await service.create(
                reportingUserId,
                createUserReportDto,
            );

            expect(userRepository.findOneBy).toHaveBeenCalledTimes(2);
            expect(userRepository.findOneBy).toHaveBeenCalledWith({
                id: reportingUserId,
            });
            expect(userRepository.findOneBy).toHaveBeenCalledWith({
                id: createUserReportDto.encounterId,
            });

            expect(userReportRepository.create).toHaveBeenCalledWith({
                ...createUserReportDto,
                reportingUser,
                reportedUser,
            });

            expect(userReportRepository.save).toHaveBeenCalledWith(
                createdUserReport,
            );

            expect(result).toEqual(createdUserReport);
        });

        it.skip("should throw an error if reporting user is not found", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                encounterId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            jest.spyOn(userRepository, "findOneBy").mockResolvedValueOnce(null);

            await expect(
                service.create(reportingUserId, createUserReportDto),
            ).rejects.toThrow("Reporting user or reported user not found");
        });

        it.skip("should throw an error if reported user is not found", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                encounterId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            const reportingUser = { id: reportingUserId } as User;

            jest.spyOn(userRepository, "findOneBy")
                .mockResolvedValueOnce(reportingUser)
                .mockResolvedValueOnce(null);

            await expect(
                service.create(reportingUserId, createUserReportDto),
            ).rejects.toThrow("Reporting user or reported user not found");
        });
    });
});
