import { MatchingService } from "@/transient-services/matching/matching.service";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { PointBuilder } from "../../../_src/builders/point.builder";
import { UserFactory } from "../../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../../_src/modules/integration-test.module";
import { clearDatabase, writeBenchmarkResult } from "../../../_src/utils/utils";
const Benchmarkify = require("benchmarkify");

describe("Matching Service Benchmarks ", () => {
    let service: MatchingService;
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let userFactory: UserFactory;
    let benchmark;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        service = module.get(MatchingService);
        userFactory = factories.get("user") as UserFactory;
        benchmark = new Benchmarkify("Matching Service", {
            description: "This is a benchmark for the matching service",
            chartImage: true,
        }).printHeader();
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);
    });

    describe("benchmarks", () => {
        for (const userCount of [1000]) {
            it(`findNearbyMatches with ${userCount} users`, async () => {
                for (let index = 0; index < userCount; index++) {
                    await userFactory.persistNewTestUser({
                        dateMode: EDateMode.LIVE,
                        location: new PointBuilder().build(0, 0),
                        gender: EGender.WOMAN,
                        genderDesire: [EGender.MAN],
                        intentions: [EIntention.RELATIONSHIP],
                        approachChoice: EApproachChoice.BE_APPROACHED,
                    });
                }

                const userToTest = await userFactory.persistNewTestUser({
                    gender: EGender.MAN,
                    genderDesire: [EGender.WOMAN],
                    intentions: [EIntention.RELATIONSHIP],
                });

                benchmark
                    .createSuite(`Find nearby matches [${userCount}]`, {
                        description: `Finding nearby matches with ${userCount} users`,
                    })

                    .add("Find nearby matches", async (done) => {
                        service
                            .findNearbyMatches(userToTest)
                            .then(() => done());
                    });

                await benchmark.run().then((res) => {
                    writeBenchmarkResult(res);
                });
            }, 100000);
            it(`findHeatmapMatches with ${userCount} users`, async () => {
                for (let index = 0; index < userCount; index++) {
                    await userFactory.persistNewTestUser({
                        dateMode: EDateMode.LIVE,
                        location: new PointBuilder().build(0, 0),
                        gender: EGender.WOMAN,
                        genderDesire: [EGender.MAN],
                        intentions: [EIntention.RELATIONSHIP],
                        approachChoice: EApproachChoice.BE_APPROACHED,
                    });
                }

                const userToTest = await userFactory.persistNewTestUser({
                    gender: EGender.MAN,
                    genderDesire: [EGender.WOMAN],
                    intentions: [EIntention.RELATIONSHIP],
                });

                benchmark
                    .createSuite(`Find heatmap matches [${userCount}]`, {
                        description: `Finding heatmap matches with ${userCount} users`,
                    })

                    .add("Find heatmap matches", async (done) => {
                        service
                            .findHeatmapMatches(userToTest)
                            .then(() => done());
                    });

                await benchmark.run().then((res) => {
                    writeBenchmarkResult(res);
                });
            }, 100000);
        }
    });
});
