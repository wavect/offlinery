import { UserFeedback } from "@/entities/user-feedback/user-feedback.entity";
import { UserFeedbackService } from "@/entities/user-feedback/user-feedback.service";
import { TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("User Feedback is processed and stored correctly ", () => {
    let service: UserFeedbackService;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let userFeedbackRepository: Repository<UserFeedback>;

    beforeAll(async () => {
        const { module, dataSource } = await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        service = module.get(UserFeedbackService);
        userFeedbackRepository = testingModule.get(
            getRepositoryToken(UserFeedback),
        );
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
    });

    it("should store user feedback", async () => {
        await service.createUserFeedback({
            feedbackText: "App is cool",
            rating: 10,
        });

        await service.createUserFeedback({
            feedbackText: "App is mid",
            rating: 5,
        });

        await service.createUserFeedback({
            feedbackText: "App is shit",
            rating: 1,
        });

        const feedback = await userFeedbackRepository.find();
        expect(feedback.length).toEqual(3);
    });
});
