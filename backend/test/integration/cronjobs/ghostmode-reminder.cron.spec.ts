import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
import { User } from "@/entities/user/user.entity";
import {
    EApproachChoice,
    EDateMode,
    EGender,
    EIntention,
} from "@/types/user.types";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PointBuilder } from "../../_src/builders/point.builder";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("CronJob: GhostMode Reminder", () => {
    let cronJobRunner: GhostModeReminderCronJob;
    let userRepository: Repository<User>;
    let userFactory: any;

    beforeEach(async () => {
        const { module, factories } = await getIntegrationTestModule();
        cronJobRunner = module.get<GhostModeReminderCronJob>(
            GhostModeReminderCronJob,
        );
        userFactory = factories.get("user");
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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

        // must be in 48 hrs
        const user3 = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.BE_APPROACHED,
            lastDateModeChange: twentyFiveHoursAgo,
            lastDateModeReminderSent: twentyFiveHoursAgo,
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
            lastDateModeReminderSent: fortyEightHoursAgo,
        });

        // User in GHOST mode, never reminded - should be notified (48h interval)
        const fortyEightHourUserNeverReminded =
            await userFactory.persistNewTestUser({
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

        const usersToBeNotified = await cronJobRunner.findGhostModeTargets(
            new Date(),
        );

        console.log(usersToBeNotified);

        expect(usersToBeNotified.size).toEqual(4);
        // Check that the correct users are included
        const notifiedUserIds = Array.from(usersToBeNotified).map(
            (target) => target.user.id,
        );

        expect(notifiedUserIds).toContain(twentyFourHourUser.id);
        expect(notifiedUserIds).toContain(fortyEightHourUserNeverReminded.id);
        expect(notifiedUserIds).toContain(sevenDayUser.id);
        // Check that the wrong users are NOT included
        expect(notifiedUserIds).not.toContain(liveUser.id);
        expect(notifiedUserIds).not.toContain(recentlyRemindedUser.id);

        // Check users are included with correct intervals
        const targetArray = Array.from(usersToBeNotified);

        // Check 24h user
        const twentyFourHourTarget = targetArray.find(
            (target) => target.user.id === twentyFourHourUser.id,
        );
        expect(twentyFourHourTarget).toBeDefined();
        expect(twentyFourHourTarget?.intervalHour.hours).toBe(24);

        // Check 48h user that has been reminded once, should not be included
        const twentyFourHourButRemindedTarget = targetArray.find(
            (target) => target.user.id === fortyEightHourUser.id,
        );
        expect(twentyFourHourButRemindedTarget).toBeUndefined();

        // Check 48h user that has never been reminded! Should be 24h
        const fortyEightHourTarget = targetArray.find(
            (target) => target.user.id === fortyEightHourUserNeverReminded.id,
        );
        expect(fortyEightHourTarget).toBeDefined();
        expect(fortyEightHourTarget?.intervalHour.hours).toBe(24);

        // Check user that has never been reminded! Should be 24h
        const fortyEightHourTargetHasBeenReminded = targetArray.find(
            (target) => target.user.id === user3.id,
        );
        expect(fortyEightHourTargetHasBeenReminded).toBeUndefined();

        // Check 7-day user
        const sevenDayTarget = targetArray.find(
            (target) => target.user.id === sevenDayUser.id,
        );
        expect(sevenDayTarget).toBeDefined();
        expect(sevenDayTarget?.intervalHour.hours).toBe(24); // 7 * 24 hours

        // Check that wrong users are still not included
        expect(
            targetArray.find((target) => target.user.id === liveUser.id),
        ).toBeUndefined();
        expect(
            targetArray.find(
                (target) => target.user.id === recentlyRemindedUser.id,
            ),
        ).toBeUndefined();
    });

    it("should notify a user whole user flow", async () => {
        const date = new Date(); // snapshot date of execution

        const twentyfourHoursUpdatedLast = new Date(
            new Date().getTime() - 25 * 60 * 60 * 1000,
        );

        const liveUser = await userFactory.persistNewTestUser({
            dateMode: EDateMode.GHOST,
            location: new PointBuilder().build(0, 0),
            gender: EGender.WOMAN,
            genderDesire: [EGender.MAN],
            intentions: [EIntention.RELATIONSHIP],
            approachChoice: EApproachChoice.APPROACH,
            lastDateModeChange: undefined,
            lastDateModeReminderSent: undefined,
        });

        await userRepository.query(
            `UPDATE "user" SET updated = $1 WHERE id = $2`,
            [twentyfourHoursUpdatedLast, liveUser.id],
        );

        /** @DEV First run - notify users once */

        const usersToBeNotified =
            await cronJobRunner.findGhostModeTargets(date);
        const targetArray = Array.from(usersToBeNotified);

        const userAfterFirstNotify = await userRepository.findOneBy({
            id: liveUser.id,
        });

        expect(userAfterFirstNotify.lastDateModeReminderSent).toBeDefined();
        // expect(userAfterFirstNotify.lastDateModeChange).toBeNull();
        const user = targetArray.find(
            (target) => target.user.id === liveUser.id,
        );
        expect(targetArray.length).toEqual(1);
        expect(user).toBeDefined();
        expect(user?.intervalHour.hours).toBe(24); // 7 * 24 hours

        /** @DEV Second run again, User has now been notified once, hence if run again, should not happen anything */
        const usersToBeNotifiedRunTwo =
            await cronJobRunner.findGhostModeTargets(date);
        expect(usersToBeNotifiedRunTwo.size).toEqual(0);

        /** @DEV set lastDateModeReminder 48 hrs into the future */
        const is48Hrsago = new Date(new Date().getTime() - 48 * 60 * 60 * 1000);
        await userRepository.update(liveUser.id, {
            lastDateModeReminderSent: is48Hrsago,
        });
        const usersToBeNotifiedRun48 =
            await cronJobRunner.findGhostModeTargets(date);
        expect(usersToBeNotifiedRun48.size).toEqual(0);

        /** @DEV set lastDateModeReminder 72 hrs into the future */
        const is72Hrsago = new Date(new Date().getTime() - 70 * 60 * 60 * 1000);
        await userRepository.update(liveUser.id, {
            lastDateModeReminderSent: is72Hrsago,
        });

        const currentUserIs = userRepository.findOneBy({ id: liveUser.id });
        console.log("currentUserIs: ", currentUserIs);

        const usersToBeNotifiedRun72 =
            await cronJobRunner.findGhostModeTargets(date);
        expect(usersToBeNotifiedRun72.size).toEqual(1); //IT FAILS HERE

        /** @DEV set lastDateModeReminder 336 hrs into the future */
        const is336hrsAgo = new Date(
            new Date().getTime() - 330 * 60 * 60 * 1000,
        );
        await userRepository.update(liveUser.id, {
            lastDateModeReminderSent: is336hrsAgo,
        });
        const usersToBeNotifiedRun336 =
            await cronJobRunner.findGhostModeTargets(date);
        expect(usersToBeNotifiedRun336.size).toEqual(1);
    }, 60000);
});
