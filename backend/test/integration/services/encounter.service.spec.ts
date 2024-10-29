import { EncounterService } from "@/entities/encounter/encounter.service";
import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { clearDatabase } from "../../_src/utils/utils";

describe("Encounter Service Integration Tests ", () => {
    let testingModule: TestingModule;
    let testingDataSource: DataSource;
    let testingMainUser: User;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let encounterService: EncounterService;

    beforeAll(async () => {
        const { module, dataSource, factories } =
            await getIntegrationTestModule();
        testingModule = module;
        testingDataSource = dataSource;

        encounterService = module.get<EncounterService>(EncounterService);
        encounterFactory = factories.get("encounter") as EncounterFactory;
        userFactory = factories.get("user") as UserFactory;
    });

    afterAll(async () => {
        await testingModule.close();
    });

    beforeEach(async () => {
        await clearDatabase(testingDataSource);

        const birthDay = new Date("1996-09-21");
        testingMainUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.LIVE,
            location: new PointBuilder().build(0, 0),
            genderDesire: [EGender.WOMAN],
            gender: EGender.MAN,
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.APPROACH,
            birthDay,
            ageRangeString: `[${getAge(birthDay) - User.defaultAgeRange},${getAge(birthDay) + User.defaultAgeRange}]`,
        });
    });

    describe("if users are nearby, they should be marked as nearby", () => {
        it("should return the encounters a user has", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            /** @DEV insert 3 rest users */
            const user1 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            const user2 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser * DPM), // Exactly at max distance
            });
            const user3 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser + 15) * DPM),
            });

            /** @DEV insert 3 test encounters to the user */
            await encounterFactory.persistTestEncounter(testingMainUser, user1);
            await encounterFactory.persistTestEncounter(testingMainUser, user2);
            await encounterFactory.persistTestEncounter(testingMainUser, user3);

            expect(
                (await encounterService.getEncountersByUser(testingMainUser.id))
                    .length,
            ).toEqual(3);
            expect(1).toEqual(1);
        });
        it("should mark users that are nearby", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            /** @DEV insert one user that is close, another one that is far away */
            const user1 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, 0),
            });
            const user2 = await userFactory.persistNewTestUser({
                location: new PointBuilder().build(
                    0,
                    (maxDistUser + 1500) * DPM,
                ),
            });

            /** @DEV insert 3 test encounters to the user */
            await encounterFactory.persistTestEncounter(testingMainUser, user1);
            await encounterFactory.persistTestEncounter(testingMainUser, user2);

            const encounters = await encounterService.getEncountersByUser(
                testingMainUser.id,
            );

            expect(encounters[0].isNearbyRightNow).toEqual(true);
            expect(encounters[1].isNearbyRightNow).toEqual(false);
            expect(encounters.length).toEqual(2);

            expect(1).toEqual(1);
        });
    });
});
