import { CalendlyService } from "@/cronjobs/calendly.service";
import { DEFAULT_INTERVAL_HOURS } from "@/cronjobs/cronjobs.types";
import { SafetyCallReminderCronJob } from "@/cronjobs/safetycall-reminder.cron";
import {
    EApproachChoice,
    EGender,
    EIntention,
    EVerificationStatus,
} from "@/types/user.types";
import { PointBuilder } from "../../_src/builders/point.builder";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("CronJob: Safety Call Reminder", () => {
    let cronJobRunner: SafetyCallReminderCronJob;
    let userFactory: any;
    let calendlyService: CalendlyService;

    beforeEach(async () => {
        const { module, factories } = await getIntegrationTestModule();
        cronJobRunner = module.get<SafetyCallReminderCronJob>(
            SafetyCallReminderCronJob,
        );
        calendlyService = module.get<CalendlyService>(CalendlyService);
        userFactory = factories.get("user");
    });

    it("should collect the correct users based on intervals and Calendly status", async () => {
        const now = new Date();

        // Create test users for each interval
        const intervalUsers = await Promise.all(
            DEFAULT_INTERVAL_HOURS.map(async (interval, index) => {
                const createdTime = new Date(
                    now.getTime() - (interval.hours + 1) * 60 * 60 * 1000,
                );

                // For the first interval, create a user with a recent reminder
                if (index === 0) {
                    return userFactory.persistNewTestUser({
                        verificationStatus: EVerificationStatus.PENDING,
                        location: new PointBuilder().build(0, 0),
                        gender: EGender.WOMAN,
                        genderDesire: [EGender.MAN],
                        intentions: [EIntention.RELATIONSHIP],
                        approachChoice: EApproachChoice.APPROACH,
                        created: createdTime,
                        lastSafetyCallVerificationReminderSent: new Date(
                            now.getTime() - 1 * 60 * 60 * 1000,
                        ), // 1 hour ago
                    });
                }

                // Create a valid user for this interval
                return userFactory.persistNewTestUser({
                    verificationStatus: EVerificationStatus.PENDING,
                    location: new PointBuilder().build(0, 0),
                    gender: EGender.WOMAN,
                    genderDesire: [EGender.MAN],
                    intentions: [EIntention.RELATIONSHIP],
                    approachChoice: EApproachChoice.APPROACH,
                    created: createdTime,
                    lastSafetyCallVerificationReminderSent:
                        index === 1 ? createdTime : null,
                });
            }),
        );

        // Create invalid test users
        const invalidUsers = await Promise.all([
            // Verified user
            userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.VERIFIED,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
                created: new Date(now.getTime() - 25 * 60 * 60 * 1000),
            }),
            // BE_APPROACHED user
            userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.PENDING,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.BE_APPROACHED,
                created: new Date(now.getTime() - 25 * 60 * 60 * 1000),
            }),
            // Too recent user
            userFactory.persistNewTestUser({
                verificationStatus: EVerificationStatus.PENDING,
                location: new PointBuilder().build(0, 0),
                gender: EGender.WOMAN,
                genderDesire: [EGender.MAN],
                intentions: [EIntention.RELATIONSHIP],
                approachChoice: EApproachChoice.APPROACH,
                created: new Date(now.getTime() - 1 * 60 * 60 * 1000),
            }),
        ]);

        // Mock Calendly service to simulate some users having no scheduled calls
        const usersWithoutCalls = new Set(
            intervalUsers
                .slice(1) // Exclude first user
                .map((user) => user.email.toLowerCase()),
        );

        jest.spyOn(
            calendlyService,
            "getEmailsOfUsersWithoutUpcomingSafetyCall",
        ).mockResolvedValue(usersWithoutCalls);

        // Run the collection
        const reminderResults = await cronJobRunner.collectUsersForReminders();

        // Verify results
        expect(reminderResults.usersToUpdate.length).toBe(
            DEFAULT_INTERVAL_HOURS.length - 2,
        ); // Exclude first interval (has call) and user with recent reminder
        expect(reminderResults.emailsToSend.length).toBe(
            DEFAULT_INTERVAL_HOURS.length - 2,
        );

        // Check that invalid users are not included
        const userIdsToUpdate = reminderResults.usersToUpdate.map((u) => u.id);
        invalidUsers.forEach((user) => {
            expect(userIdsToUpdate).not.toContain(user.id);
        });

        // Check that user with scheduled call is not included
        expect(userIdsToUpdate).not.toContain(intervalUsers[0].id);

        // Check that emails will be sent with correct intervals
        reminderResults.emailsToSend.forEach(({ user, interval }) => {
            const matchingIntervalUser = intervalUsers.find(
                (u) => u.id === user.id,
            );
            expect(matchingIntervalUser).toBeDefined();

            // Verify interval matches user's creation time
            const hoursSinceCreation =
                (now.getTime() - matchingIntervalUser.created.getTime()) /
                (60 * 60 * 1000);
            expect(hoursSinceCreation).toBeGreaterThan(interval.hours);
        });
    });

    it("should send reminders and update users correctly", async () => {
        const now = new Date();
        const twentyFiveHoursAgo = new Date(
            now.getTime() - 25 * 60 * 60 * 1000,
        );

        // Create test user
        const testUser = await userFactory.persistNewTestUser({
            verificationStatus: EVerificationStatus.PENDING,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.APPROACH,
            created: twentyFiveHoursAgo,
            lastSafetyCallVerificationReminderSent: null,
        });

        // Mock Calendly service to return user as needing a call
        jest.spyOn(
            calendlyService,
            "getEmailsOfUsersWithoutUpcomingSafetyCall",
        ).mockResolvedValue(new Set([testUser.email.toLowerCase()]));

        // Run the cron job
        await cronJobRunner.checkSafetyCallVerificationPending();
    });
});
