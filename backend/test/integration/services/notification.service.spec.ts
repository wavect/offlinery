import { EAppScreens } from "@/DTOs/notification-navigate-user.dto";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import { getAge } from "@/utils/date.utils";
import { I18nService } from "nestjs-i18n";
import { DataSource, DataSourceOptions } from "typeorm";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

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

    beforeEach(async () => {
        const mockDataSourceOptions: DataSourceOptions = {
            type: "sqlite",
            database: ":memory:",
            entities: [UserReport],
            synchronize: true,
        };
        new DataSource(mockDataSourceOptions);
        const { module } = await getIntegrationTestModule();

        notificationService =
            module.get<NotificationService>(NotificationService);
        i18nService = module.get<I18nService<I18nTranslations>>(I18nService);
    });

    describe("notification service", () => {
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
});
