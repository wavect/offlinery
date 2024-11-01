import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { EApproachChoice, EDateMode, EGender } from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { I18nService } from "nestjs-i18n";
import { DataSource, DataSourceOptions } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";
import { testChrisNativeIosPushToken } from "../../_src/utils/utils";

// Sends to Kevin's smartphone rn
const testPushTokenKevin = "ExponentPushToken[MbIGoaN3gTd61gYRRCRz8C]";
// Send to Chris' smartphone rn
const testPushTokenChris = "ExponentPushToken[sv2J8DEa84U3iStoXhafI0]";

const mockUser: UserPublicDTO = {
    id: "123456789",
    firstName: "John",
    age: getAge(new Date("1990-01-01")),
    imageURIs: ["image1.jpg", "image2.jpg", "image3.jpg"],
    bio: "Hi, I am John. Nice to meet you!",
};

describe("NotificationService", () => {
    let notificationService: NotificationService;
    let i18nService: I18nService<I18nTranslations>;
    let userFactory: UserFactory;
    let userService: UserService;

    beforeEach(async () => {
        const mockDataSourceOptions: DataSourceOptions = {
            type: "sqlite",
            database: ":memory:",
            entities: [UserReport],
            synchronize: true,
        };
        new DataSource(mockDataSourceOptions);
        const { module, factories } = await getIntegrationTestModule();

        userService = module.get<UserService>(UserService);
        userFactory = factories.get("encounter") as UserFactory;
        notificationService =
            module.get<NotificationService>(NotificationService);
        i18nService = module.get<I18nService<I18nTranslations>>(I18nService);
    });

    describe("notifications creation", () => {
        it.skip("send push notification to Kevins device", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushTokenKevin, // could be also multiple users at once! (we will need that)
                    sound: "default",
                    title: i18nService.t("main.notification.newMatch.title", {
                        args: { firstName: mockUser.firstName },
                    }),
                    body: i18nService.t("main.notification.newMatch.body"),
                    data: {
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        navigateToPerson: mockUser,
                        encounterId: "abc",
                    },
                },
            ];
            const res =
                await notificationService.sendPushNotification(messages);
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
        it.skip("send push notification to Chris' device", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushTokenChris,
                    sound: "default",
                    title: "Lisa is nearby! 🔥",
                    body: i18nService.t("main.notification.newMatch.body"),
                    data: {
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        navigateToPerson: mockUser,
                        encounterId: "abc",
                    },
                },
            ];
            const res =
                await notificationService.sendPushNotification(messages);
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
    });

    describe("notifications creation after locatinp update", function () {
        it("user approaches another user and gets a notification", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: testChrisNativeIosPushToken,
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
                birthDay: new Date("1996-09-21"),
            });

            /** @DEV three random users that are nearby */
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser - 1) * DPM), // 1 meter less than max
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, maxDistUser - 2 * DPM), // Exactly at max distance
            });
            await userFactory.persistNewTestUser({
                location: new PointBuilder().build(0, (maxDistUser + 15) * DPM),
            });

            /** @DEV location update that triggers notifyMatches */
            const userUpdated = await userService.updateLocation(
                testingMainUser.id,
                {
                    latitude: 0,
                    longitude: 0,
                },
            );

            /** expect to run through without failure */
            expect(userUpdated).toBeDefined();
        });
    });
});
