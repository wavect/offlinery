import { Encounter } from "@/entities/encounter/encounter.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserReportService } from "@/entities/user-report/user-report.service";
import { User } from "@/entities/user/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { mockRepository } from "../../_src/utils/utils";

describe("UserReportService", () => {
    let service: UserReportService;

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
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
