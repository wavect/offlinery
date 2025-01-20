import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { PointBuilder } from "../../_src/builders/point.builder";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("CronJob: GhostMode Reminder", () => {
    let cronJobRunner: GhostModeReminderCronJob;
    let userFactory: any;

    beforeEach(async () => {
        const { module, factories } = await getIntegrationTestModule();
        cronJobRunner = module.get<GhostModeReminderCronJob>(
            GhostModeReminderCronJob,
        );
        userFactory = factories.get("user");
    });

    it("should collect the correct amount of users to be notified", async () => {
        const now = new Date();
        const twentyFiveHoursAgo = new Date(
            now.getTime() - 25 * 60 * 60 * 1000,
        );
        const fortyEightHoursAgo = new Date(
            now.getTime() - 48 * 60 * 60 * 1000,
        );
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // User in LIVE mode - should NOT be notified
        const liveUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.LIVE,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
        });

        // User in GHOST mode, 25h without reminder - should be notified (24h interval)
        const twentyFourHourUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
            lastDateModeChange: twentyFiveHoursAgo,
            lastDateModeReminderSent: null,
        });

        // User in GHOST mode, 48h without reminder - should be notified (48h interval)
        const fortyEightHourUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
            lastDateModeChange: fortyEightHoursAgo,
            lastDateModeReminderSent: null,
        });

        // User in GHOST mode, 7 days without reminder - should be notified (7-day interval)
        const sevenDayUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
            lastDateModeChange: sevenDaysAgo,
            lastDateModeReminderSent: null,
        });

        // User in GHOST mode but with recent reminder - should NOT be notified
        const recentlyRemindedUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
            lastDateModeChange: sevenDaysAgo,
            lastDateModeReminderSent: now,
        });

        const usersToBeNotified = await cronJobRunner.findGhostModeTargets();

        expect(usersToBeNotified.length).toEqual(4);
        // Check that the correct users are included
        const notifiedUserIds = usersToBeNotified.map(
            (target) => target.user.id,
        );
        expect(notifiedUserIds).toContain(twentyFourHourUser.id);
        expect(notifiedUserIds).toContain(fortyEightHourUser.id);
        expect(notifiedUserIds).toContain(sevenDayUser.id);
        // Check that the wrong users are NOT included
        expect(notifiedUserIds).not.toContain(liveUser.id);
        expect(notifiedUserIds).not.toContain(recentlyRemindedUser.id);
    });
});
