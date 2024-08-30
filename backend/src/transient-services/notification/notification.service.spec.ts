import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { DataSource, DataSourceOptions } from "typeorm";
import { BlacklistedRegionModule } from "../../blacklisted-region/blacklisted-region.module";
import { EAppScreens } from "../../DTOs/notification-navigate-user.dto";
import { UserPublicDTO } from "../../DTOs/user-public.dto";
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
            ],
        })
            .overrideProvider(getDataSourceToken())
            .useValue(mockDataSource)
            .compile();

        notificationService = app.get<NotificationService>(NotificationService);
    });

    describe("notification service", () => {
        it("send push notification", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushToken, // could be also multiple users at once! (we will need that)
                    sound: "default",
                    title: "Ariana is nearby! 🔥",
                    subtitle: "Find. Approach. IRL.",
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
