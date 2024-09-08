import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../../../src/app.controller";
import { AppService } from "../../../src/app.service";

describe("AppController", () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
        appService = app.get<AppService>(AppService);
    });

    describe("getUptime", () => {
        it("should return uptime string", () => {
            const result = "Application started 10.000 seconds ago.";
            jest.spyOn(appService, "getUptime").mockImplementation(
                () => result,
            );

            expect(appController.getUptime()).toBe(result);
        });
    });
});
