import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserReportDTO } from "../../../src/DTOs/create-user-report.dto";
import { UserReport } from "../../../src/entities/user-report/user-report.entity";
import { UserReportService } from "../../../src/entities/user-report/user-report.service";
import { User } from "../../../src/entities/user/user.entity";
import { EIncidentType } from "../../../src/types/user.types";

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
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOneBy: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserReportService>(UserReportService);
        userReportRepository = module.get<Repository<UserReport>>(
            getRepositoryToken(UserReport),
        );
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        it("should create a new user report", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                reportedUserId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            const reportingUser = { id: reportingUserId } as User;
            const reportedUser = {
                id: createUserReportDto.reportedUserId,
            } as User;

            (userRepository.findOneBy as jest.Mock)
                .mockResolvedValueOnce(reportingUser)
                .mockResolvedValueOnce(reportedUser);

            const createdUserReport = {
                ...createUserReportDto,
                reportingUser,
                reportedUser,
            } as any as UserReport;

            (userReportRepository.create as jest.Mock).mockReturnValue(
                createdUserReport,
            );
            (userReportRepository.save as jest.Mock).mockResolvedValue(
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
                id: createUserReportDto.reportedUserId,
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

        it("should throw an error if reporting user is not found", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                reportedUserId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            (userRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                service.create(reportingUserId, createUserReportDto),
            ).rejects.toThrow("Reporting user or reported user not found");
        });

        it("should throw an error if reported user is not found", async () => {
            const reportingUserId = "1";
            const createUserReportDto: CreateUserReportDTO = {
                reportedUserId: "2",
                incidentDescription: "Test incident",
                keepReporterInTheLoop: true,
                incidentType: EIncidentType.SexualHarassment,
            };

            const reportingUser = { id: reportingUserId } as User;

            (userRepository.findOneBy as jest.Mock)
                .mockResolvedValueOnce(reportingUser)
                .mockResolvedValueOnce(null);

            await expect(
                service.create(reportingUserId, createUserReportDto),
            ).rejects.toThrow("Reporting user or reported user not found");
        });
    });
});
