import { goBackInTimeFor, TimeSpan } from "@/cronjobs/cronjobs.types";
import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
import { User } from "@/entities/user/user.entity";
import { EApproachChoice, EDateMode } from "@/types/user.types";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("CronJob: GhostMode Reminder", () => {
    let service: GhostModeReminderCronJob;
    let userRepository: Repository<User>;
    let userFactory: any;
    let baseUser: any;

    beforeEach(async () => {
        baseUser = {
            dateMode: EDateMode.GHOST,
            approachChoice: EApproachChoice.BE_APPROACHED,
        };
        const { module, factories } = await getIntegrationTestModule();
        service = module.get<GhostModeReminderCronJob>(
            GhostModeReminderCronJob,
        );
        userFactory = factories.get("user");
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    describe("OfflineUsersService", () => {
        it("should identify users for ONE_DAY reminder correctly", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(25, "hours"),
                lastDateModeReminderSent: null, // Never reminded
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
            expect(result[0].user.id).toEqual(user.id);
        });
        it("should not remind ONE_DAY users if already reminded within 24h", async () => {
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(25, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(23, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result.length).toEqual(0);
        });
        it("should identify users for THREE_DAYS reminder correctly", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(73, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(49, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.THREE_DAYS);
            expect(result[0].user.id).toEqual(user.id);
        });
        it("should identify users for TWO_WEEKS reminder correctly", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            expect(result[0].user.id).toEqual(user.id);
        });
        it("should not include users in multiple buckets", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            expect(result[0].user.id).toEqual(user.id);
        });
        it("should correctly handle multiple users in different time buckets", async () => {
            // ONE_DAY users
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(25, "hours"),
                lastDateModeReminderSent: null,
            });
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(30, "hours"),
                lastDateModeReminderSent: null,
            });

            // THREE_DAYS users
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(73, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(49, "hours"),
            });
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(100, "hours"),
                lastDateModeReminderSent: null,
            });

            // TWO_WEEKS users
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
            });

            const result = await service.findOfflineUsers();

            // Check counts per bucket
            const oneDayUsers = result.filter((u) => u.type === "ONE_DAY");
            const threeDayUsers = result.filter((u) => u.type === "THREE_DAYS");
            const twoWeekUsers = result.filter((u) => u.type === "TWO_WEEKS");

            expect(oneDayUsers).toHaveLength(2);
            expect(threeDayUsers).toHaveLength(2);
            expect(twoWeekUsers).toHaveLength(1);

            // Run again and verify no users are returned (they've been reminded)
            const secondResult = await service.findOfflineUsers();
            expect(secondResult).toHaveLength(0);
        });
        it("should handle edge cases with users just crossing time thresholds", async () => {
            await Promise.all([
                // Just crossed into ONE_DAY (24 hours + 1 minute)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(24.02, "hours"),
                    lastDateModeReminderSent: null,
                }),
                // Just crossed into THREE_DAYS (72 hours + 1 minute)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(72.02, "hours"),
                    lastDateModeReminderSent: null,
                }),
                // Just crossed into TWO_WEEKS (336 hours + 1 minute)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(336.02, "hours"),
                    lastDateModeReminderSent: null,
                }),
            ]);

            const result = await service.findOfflineUsers();
            expect(result).toHaveLength(3);

            const types = result.map((u) => u.type);
            expect(types).toContain("ONE_DAY");
            expect(types).toContain("THREE_DAYS");
            expect(types).toContain("TWO_WEEKS");
        });
        it("should not include users who were recently reminded", async () => {
            await Promise.all([
                // Reminded 23 hours ago (should not be included)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(25, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(23, "hours"),
                }),
                // Reminded 47 hours ago (should not be included)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(73, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(47, "hours"),
                }),
                // Reminded 263 hours ago (should not be included)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(337, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(263, "hours"),
                }),
            ]);

            const result = await service.findOfflineUsers();
            expect(result).toHaveLength(0);
        });
        it("should handle mixed scenarios of reminded and never reminded users", async () => {
            await Promise.all([
                // ONE_DAY - never reminded
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(25, "hours"),
                    lastDateModeReminderSent: null,
                }),
                // ONE_DAY - recently reminded (should not be included)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(25, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(23, "hours"),
                }),
                // THREE_DAYS - never reminded
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(73, "hours"),
                    lastDateModeReminderSent: null,
                }),
                // THREE_DAYS - recently reminded (should not be included)
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(73, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(47, "hours"),
                }),
                // TWO_WEEKS - never reminded
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(337, "hours"),
                    lastDateModeReminderSent: null,
                }),
            ]);

            const result = await service.findOfflineUsers();
            expect(result).toHaveLength(3);

            // Verify correct distribution
            const types = result.map((u) => u.type);
            expect(types.filter((t) => t === "ONE_DAY")).toHaveLength(1);
            expect(types.filter((t) => t === "THREE_DAYS")).toHaveLength(1);
            expect(types.filter((t) => t === "TWO_WEEKS")).toHaveLength(1);
        });
        it("should handle progression through reminder stages", async () => {
            // Create a user that will progress through all stages
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"), // Qualifies for TWO_WEEKS
                lastDateModeReminderSent: null,
            });

            // First run - should get TWO_WEEKS reminder
            const firstResult = await service.findOfflineUsers();
            expect(firstResult).toHaveLength(1);
            expect(firstResult[0].type).toBe("TWO_WEEKS");

            // Update user's lastDateModeChange to qualify for THREE_DAYS
            await userRepository.update(user.id, {
                lastDateModeChange: goBackInTimeFor(73, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(49, "hours"),
            });

            // Second run - should get THREE_DAYS reminder
            const secondResult = await service.findOfflineUsers();
            expect(secondResult).toHaveLength(1);
            expect(secondResult[0].type).toBe("THREE_DAYS");

            // Update user's lastDateModeChange to qualify for ONE_DAY
            await userRepository.update(user.id, {
                lastDateModeChange: goBackInTimeFor(25, "hours"),
                lastDateModeReminderSent: null,
            });

            // Third run - should get ONE_DAY reminder
            const thirdResult = await service.findOfflineUsers();
            expect(thirdResult).toHaveLength(1);
            expect(thirdResult[0].type).toBe("ONE_DAY");

            // Final run - should get no reminders (already reminded)
            const finalResult = await service.findOfflineUsers();
            expect(finalResult).toHaveLength(0);
        });
    });
});
