import { goBackInTimeFor } from "@/cronjobs/cronjobs.types";
import { ENotificationType } from "@/DTOs/abstract/base-notification.adto";
import { EAppScreens } from "@/DTOs/enums/app-screens.enum";
import { UserPublicDTO } from "@/DTOs/user-public.dto";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserService } from "@/entities/user/user.service";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { I18nTranslations } from "@/translations/i18n.generated";
import { OfflineryNotification } from "@/types/notification-message.types";
import {
    EApproachChoice,
    EDateMode,
    EEncounterStatus,
    EGender,
    EIntention,
    ELanguage,
} from "@/types/user.types";
import { getAge } from "@/utils/date.utils";
import { I18nService } from "nestjs-i18n";
import { DataSource, DataSourceOptions } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { EncounterFactory } from "../../_src/factories/encounter.factory";
import { UserFactory } from "../../_src/factories/user.factory";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

// Sends to Kevin's smartphone rn
const testPushTokenKevin = "ExponentPushToken[MbIGoaN3gTd61gYRRCRz8C]";
// Send to Chris' smartphone rn
const testPushTokenChris = "ExponentPushToken[sv2J8DEa84U3iStoXhafI0]";
const testPushTokenNatalia = "ExponentPushToken[wxGSHGKJcZi6WRLsGXAyB0]";
const testPushTokenChrisAndroid = "ExponentPushToken[ubhhWpDP1x7ecywnYLmCzg]";
// Send to Mock Device (send to nowhere)
export const testPushTokenMockDevice = "ExponentPushToken[mock-device]";
export const testPushTokenMockDevice2 = "ExponentPushToken[mock-device]";

/** @DEV todo split up for each test, otherwise changes to this object fails all tests */
const mockUser: UserPublicDTO = {
    id: "123456789",
    firstName: "John",
    age: getAge(new Date("1990-01-01")),
    imageURIs: ["image1.jpg", "image2.jpg", "image3.jpg"],
    bio: "Hi, I am John. Nice to meet you!",
    intentions: [
        EIntention.CASUAL,
        EIntention.RELATIONSHIP,
        EIntention.FRIENDSHIP,
    ],
};

describe("NotificationService", () => {
    let notificationService: NotificationService;
    let i18nService: I18nService<I18nTranslations>;
    let userFactory: UserFactory;
    let encounterFactory: EncounterFactory;
    let userService: UserService;
    let encounterService: EncounterService;

    /** @DEV if you want to run the tests here with a real token on your device, add your token here. */
    const token = () => "ExponentPushToken[";

    /** @DEV - keep this one as-is*/
    const validVoidToken = "ExpoPushToken[";

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
        encounterService = module.get<EncounterService>(EncounterService);
        userFactory = factories.get("user") as UserFactory;
        encounterFactory = factories.get("encounter") as EncounterFactory;
        notificationService =
            module.get<NotificationService>(NotificationService);
        i18nService = module.get<I18nService<I18nTranslations>>(I18nService);
    });

    describe.skip("notifications factory (skipped by default, enable to manually test)", () => {
        it("send push notification to Kevins device", async () => {
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
                        type: ENotificationType.NEW_MATCH,
                    },
                },
            ];
            const res =
                await notificationService.sendPushNotifications(messages);
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
        it("send push notification to Natalias' iOS device", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushTokenNatalia,
                    sound: "default",
                    title: "Chris is nearby! 🔥",
                    body: i18nService.t("main.notification.newMatch.body"),
                    data: {
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        navigateToPerson: mockUser,
                        encounterId: "abc",
                        type: ENotificationType.NEW_MATCH,
                    },
                },
            ];
            const res =
                await notificationService.sendPushNotifications(messages);
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
        it("send push notification to Chris' Android device", async () => {
            const messages: OfflineryNotification[] = [
                {
                    to: testPushTokenChrisAndroid,
                    sound: "default",
                    title: "Lisa is nearby! 🔥",
                    body: i18nService.t("main.notification.newMatch.body"),
                    data: {
                        screen: EAppScreens.NAVIGATE_TO_APPROACH,
                        navigateToPerson: mockUser,
                        encounterId: "abc",
                        type: ENotificationType.NEW_MATCH,
                    },
                },
            ];
            const res =
                await notificationService.sendPushNotifications(messages);
            expect(res.length).toBe(1);
            expect(res[0].status).toBe("ok");
        });
        it("should have the correct languages defined", function () {
            const lang = i18nService.getSupportedLanguages();
            expect(lang).toContain("de");
            expect(lang).toContain("en");
        });
        it("should lead NEW_MATCH notification users to the Encounter Screen", async () => {
            const user = await userFactory.persistNewTestUser({
                firstName: "Lisa Maria",
                pushToken: testPushTokenChris,
                preferredLanguage: ELanguage.de,
            });
            const notification =
                await notificationService.buildNewMatchBaseNotification(user);
            expect(notification.data.screen).toEqual(
                EAppScreens.NAVIGATE_TO_APPROACH,
            );
        });
        it("should create a NEW_MATCH notification in EN", async () => {
            const user = await userFactory.persistNewTestUser({
                pushToken: testPushTokenChris,
                preferredLanguage: ELanguage.en,
            });
            const n =
                await notificationService.buildNewMatchBaseNotification(user);
            expect(n.title).toEqual(`${user.firstName} is nearby! 🔥`);
            expect(n.body).toEqual(
                `Click to approach ${user.firstName} in real life.`,
            );
        });
        it("should create a NEW_MATCH notification in DE", async () => {
            const user = await userFactory.persistNewTestUser({
                pushToken: testPushTokenChris,
                preferredLanguage: ELanguage.de,
            });
            const n =
                await notificationService.buildNewMatchBaseNotification(user);

            expect(n.title).toEqual(`${user.firstName} ist in der Nähe! 🔥`);
            expect(n.body).toEqual(
                `Klicke um ${user.firstName} in der realen Welt anzusprechen.`,
            );
        });
        it("should send 2 notifications in both languages", async () => {
            const user = await userFactory.persistNewTestUser({
                firstName: "Lisa",
                pushToken: testPushTokenChris,
                preferredLanguage: ELanguage.de,
            });
            const notification =
                await notificationService.buildNewMatchBaseNotification(user);
            await notificationService.sendPushNotifications([
                {
                    ...notification,
                    to: user.pushToken,
                    data: {
                        ...notification.data,
                        navigateToPerson: user.convertToPublicDTO(),
                        encounterId: "1",
                    },
                },
            ]);
        });
        it("should send 2 notifications in both languages", async () => {
            const user = await userFactory.persistNewTestUser({
                firstName: "Lisa",
                pushToken: testPushTokenChris,
                preferredLanguage: ELanguage.en,
            });
            const notification =
                await notificationService.buildNewMatchBaseNotification(user);
            await notificationService.sendPushNotifications([
                {
                    ...notification,
                    to: user.pushToken,
                    data: {
                        ...notification.data,
                        navigateToPerson: user.convertToPublicDTO(),
                        encounterId: "1",
                    },
                },
            ]);
        });
    });

    describe("MOVE away => edge tests for close locations", function () {
        it("user approaches another user and gets a notification", async () => {
            const maxDistUser = 1500;
            const DPM = 1 / 111139;

            const testingMainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: testPushTokenMockDevice,
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
            const { updatedUser, notifications, expoPushTickets } =
                await userService.updateLocation(testingMainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });

            /** expect to run through without failure */
            expect(notifications.length).toEqual(1);
            expect(expoPushTickets.length).toEqual(1);
            expect(updatedUser).toBeDefined();
        });
    });

    describe("Test all approach choices and when to receive notifications ", function () {
        /** @DEV copy this block then and do it for BOTH <> BOTH etc. */
        describe("[BeApproached] sends location update with [BeApproached] nearby", function () {
            it("should send 0 notification to the approaching user", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[BeApproached] sends location update with [Approach] nearby", function () {
            it("should send 1 notification to the approaching user", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[BeApproached] sends location update with [Both] nearby", function () {
            it("should send 1 notification to the approaching user", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(otherUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BE_APPROACHED,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });

        describe("[Approach] sends location update with [BeApproached] nearby", function () {
            it("should send 1 notification to the approaching user", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[Approach] sends location update with [Approach] nearby", function () {
            it("should send 0 notification as both want to be approached", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[Approach] sends location update with [Both] nearby", function () {
            it("should send 2 notification to both users", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.APPROACH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });

        describe("[Both] sends location update with [BeApproached] nearby", function () {
            it("should send 1 notification to the approaching user", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 1 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications[0].to).toEqual(mainUser.pushToken);
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[Both] sends location update with [Both] nearby", function () {
            it("should send 2 notification, one to each users", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    pushToken: validVoidToken,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is exactly 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    pushToken: validVoidToken,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(24, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is older than 24hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(25, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(2);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(2);
                expect(updatedUser).toBeDefined();
            });
            it("should send 2 notifications as they have an encounter that is older than 72hrs and on met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BE_APPROACHED,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(72, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(1);
                expect(notifications.find((n) => n.to === mainUser.pushToken));
                expect(notifications.find((n) => n.to === otherUser.pushToken));
                expect(expoPushTickets.length).toEqual(1);
                expect(updatedUser).toBeDefined();
            });
            it("should send 0 notifications as they have an encounter that is less than 24hrs old and met_interested", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                const otherUser = await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.BOTH,
                    location: new PointBuilder().build(0, 0),
                });

                await encounterFactory.persistNewTestEncounter(
                    mainUser,
                    otherUser,
                    {
                        status: EEncounterStatus.MET_INTERESTED,
                        lastDateTimePassedBy: goBackInTimeFor(23, "hours"),
                    },
                );

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
        describe("[Both] sends location update with [Approach] nearby", function () {
            it("should send 0 notification, as approach user should not be approachable", async () => {
                const mainUser = await userFactory.persistNewTestUser({
                    dateMode: EDateMode.LIVE,
                    location: new PointBuilder().build(0, 0),
                    pushToken: token(),
                    genderDesire: [EGender.WOMAN],
                    gender: EGender.MAN,
                    approachChoice: EApproachChoice.BOTH,
                });

                await userFactory.persistNewTestUser({
                    firstName: "User1",
                    approachChoice: EApproachChoice.APPROACH,
                    pushToken: validVoidToken,
                    location: new PointBuilder().build(0, 0),
                });

                /** @DEV location update that triggers encounters */
                const { updatedUser, notifications, expoPushTickets } =
                    await userService.updateLocation(mainUser.id, {
                        latitude: 0,
                        longitude: 0,
                    });

                expect(notifications.length).toEqual(0);
                expect(expoPushTickets.length).toEqual(0);
                expect(updatedUser).toBeDefined();
            });
        });
    });

    describe("should have the correct notification content for every optin", function () {});

    describe("Misc Tests", function () {
        it("should increase the streak for certain encounters, for some not etc. outsource!", function () {});
        it("should not send any notifications if invalid push token", function () {});
        it("should not send any notifications if user is in ghost mode", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                dateMode: EDateMode.GHOST,
                location: new PointBuilder().build(0, 0),
                pushToken: token(),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
            });

            await userFactory.persistNewTestUser({
                firstName: "User1",
                approachChoice: EApproachChoice.BE_APPROACHED,
                location: new PointBuilder().build(0, 0),
            });

            /** @DEV location update that triggers encounters */
            const { updatedUser, notifications, expoPushTickets } =
                await userService.updateLocation(mainUser.id, {
                    latitude: 0,
                    longitude: 0,
                });

            expect(notifications.length).toEqual(0);
            expect(expoPushTickets.length).toEqual(0);
            expect(updatedUser).toBeDefined();
        });
        it("should have the correct notification content for Approach > BeApproached", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "MainUser",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: token(),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.APPROACH,
            });

            const otherUser = await userFactory.persistNewTestUser({
                firstName: "User1",
                approachChoice: EApproachChoice.BE_APPROACHED,
                location: new PointBuilder().build(0, 0),
            });

            /** @DEV location update that triggers encounters */
            const { notifications } = await userService.updateLocation(
                mainUser.id,
                {
                    latitude: 0,
                    longitude: 0,
                },
            );

            const encounter = await encounterService.findEncountersByUser(
                mainUser.id,
            );

            expect(notifications.length).toEqual(1);
            expect(notifications[0].to).toEqual(mainUser.pushToken);
            expect(notifications[0].title).toEqual(
                `${otherUser.firstName} is nearby! 🔥`,
            );
            expect(notifications[0].data.navigateToPerson["firstName"]).toEqual(
                otherUser.firstName,
            );
            expect(notifications[0].body).toEqual(
                `Click to approach ${otherUser.firstName} in real life.`,
            );
            expect(notifications[0].data.encounterId).toEqual(encounter[0].id);
        });
        it("should have the correct notification content for Both > Both", async () => {
            const mainUser = await userFactory.persistNewTestUser({
                firstName: "Mainuser",
                dateMode: EDateMode.LIVE,
                location: new PointBuilder().build(0, 0),
                pushToken: token(),
                genderDesire: [EGender.WOMAN],
                gender: EGender.MAN,
                approachChoice: EApproachChoice.BOTH,
            });

            const otherUser = await userFactory.persistNewTestUser({
                firstName: "User1",
                approachChoice: EApproachChoice.BOTH,
                location: new PointBuilder().build(0, 0),
            });

            /** @DEV location update that triggers encounters */
            const { notifications } = await userService.updateLocation(
                mainUser.id,
                {
                    latitude: 0,
                    longitude: 0,
                },
            );

            const nOne = notifications.find(
                (u) => u.to === otherUser.pushToken,
            );

            const encounter = await encounterService.findEncountersByUser(
                mainUser.id,
            );

            const nTwo = notifications.find((u) => u.to === mainUser.pushToken);

            expect(nOne.title).toEqual(`${mainUser.firstName} is nearby! 🔥`);
            expect(nOne.body).toEqual(
                `Click to approach ${mainUser.firstName} in real life.`,
            );
            expect(nOne.data.encounterId).toEqual(encounter[0].id);
            expect(nOne.data.navigateToPerson["firstName"]).toEqual(
                mainUser.firstName,
            );

            expect(nTwo.title).toEqual(`${otherUser.firstName} is nearby! 🔥`);
            expect(nTwo.body).toEqual(
                `Click to approach ${otherUser.firstName} in real life.`,
            );
            expect(nTwo.data.encounterId).toEqual(encounter[0].id);
            expect(nTwo.data.navigateToPerson["firstName"]).toEqual(
                otherUser.firstName,
            );
        });
    });
});
