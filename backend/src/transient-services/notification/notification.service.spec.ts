import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { I18nModule, I18nService } from "nestjs-i18n";
import * as path from "node:path";
import { DataSource, DataSourceOptions } from "typeorm";
import { BlacklistedRegionModule } from "../../blacklisted-region/blacklisted-region.module";
import { EAppScreens } from "../../DTOs/notification-navigate-user.dto";
import { UserPublicDTO } from "../../DTOs/user-public.dto";
import { I18nTranslations } from "../../translations/i18n.generated";
import { ELanguage } from "../../types/user.types";
import { UserReport } from "../../user-report/user-report.entity";
import { UserReportModule } from "../../user-report/user-report.module";
import { UserModule } from "../../user/user.module";
import { getAge } from "../../utils/date.utils";
import { OfflineryNotification } from "./notification-message.type";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

// Sends to Kevin's smartphone rn
const testPushToken = "ExponentPushToken[MbIGoaN3gTd61gYRRCRz8C]"; // TODO

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

        const mockDataSource = new DataSource(mockDataSourceOptions);

        const app: TestingModule = await Test.createTestingModule({
            controllers: [NotificationController],
            providers: [NotificationService],
            imports: [
                UserModule,
                UserReportModule,
                BlacklistedRegionModule,
                TypeOrmModule.forRoot(mockDataSourceOptions),
                TypeOrmModule.forFeature([UserReport]),
                I18nModule.forRoot({
                    fallbackLanguage: ELanguage.en,
                    loaderOptions: {
                        path: path.join(__dirname, "..", "..", "translations"),
                        watch: true,
                    },
                }),
            ],
        })
            .overrideProvider(getDataSourceToken())
            .useValue(mockDataSource)
            .compile();

        notificationService = app.get<NotificationService>(NotificationService);
        i18nService = app.get<I18nService<I18nTranslations>>(I18nService);
    });

    describe("notification service", () => {
        it("send push notification", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushToken, // could be also multiple users at once! (we will need that)
                    sound: "default",
                    title: i18nService.t("main.notification.newMatch.title", {
                        args: { firstName: mockUser.firstName },
                    }),
                    body: i18nService.t("main.notification.newMatch.body"),
                    data: {
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        navigateToPerson: mockUser,
                    },
                },
            ];
            const res = await notificationService.sendPushNotification(
                testPushToken,
                messages,
            );
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
    });
});
