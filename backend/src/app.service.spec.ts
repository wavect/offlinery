import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";

describe("AppService", () => {
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppService],
        }).compile();

        appService = module.get<AppService>(AppService);
    });

    describe("getUptime", () => {
        it("should return uptime string", () => {
            const mockUptime = 10.123;
            jest.spyOn(process, "uptime").mockImplementation(() => mockUptime);

            const result = appService.getUptime();
            expect(result).toBe("Application started 10.123 seconds ago.");
        });

        it("should round uptime to three decimal places", () => {
            const mockUptime = 10.1234567;
            jest.spyOn(process, "uptime").mockImplementation(() => mockUptime);

            const result = appService.getUptime();
            expect(result).toBe("Application started 10.123 seconds ago.");
        });
    });
});
