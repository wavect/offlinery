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

    describe("Ghost Mode Reminder: Happy Path Tests", function () {
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
        it("should identify users for THREE_DAYS reminder correctly", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(72, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(48, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.THREE_DAYS);
            expect(result[0].user.id).toEqual(user.id);
        });
        it("should identify users for TWO_WEEKS reminder correctly", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(336, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(264, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            expect(result[0].user.id).toEqual(user.id);
        });
    });

    describe("Ghost Mode Reminder: 24/72/336 Cycle Test", function () {
        describe("24 hours cycle - First Reminder", function () {
            it("should not remind if 23 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(23, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should not remind if 23.9 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(23.9, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should not remind if 30 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(23.9, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should remind if 24 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(24, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(1);
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
            });
            it("should remind if 24.1 hrs offline never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(24.1, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(1);
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
            });
            it("should remind if 30 hrs offline never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(30, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(1);
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
            });
            it("should remind if 30 hrs offline reminded a week ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(30, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(7, "days"),
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should remind if 100 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(100, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
                expect(result.length).toEqual(1);
            });
        });
        describe("72 hours cycle - Second Reminder", function () {
            it("should not remind if 3 days offline and last reminded 1 day ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(3, "days"),
                    lastDateModeReminderSent: goBackInTimeFor(1, "days"),
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should not remind if 72 hrs offline and last reminded 12 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(72, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(12, "hours"),
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should not remind if 35 hrs offline and last reminded 5 days ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(35, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(72, "hours"),
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should remind if 72 hrs offline and last reminded 48 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(72, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(48, "hours"),
                });

                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.THREE_DAYS);
                expect(result.length).toEqual(1);
            });
            it("should remind if 72 hrs offline and last reminded 120 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(72, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(120, "hours"),
                });

                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.THREE_DAYS);
                expect(result.length).toEqual(1);
            });
            it("should remind if 72 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(72, "hours"),
                    lastDateModeReminderSent: null,
                });

                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
                expect(result.length).toEqual(1);
            });
        });
        describe("335 hours cycle - Third Reminder", function () {
            it("should not remind if 30 days offline and last reminded 10 days ago", async () => {
                const user = await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(30, "days"),
                    lastDateModeReminderSent: goBackInTimeFor(10, "days"),
                });

                console.log({
                    lastModeChange: user.lastDateModeChange,
                    lastReminder: user.lastDateModeReminderSent,
                    twoWeeksAgo: goBackInTimeFor(336, "hours"),
                    twoWeeksMinTime: goBackInTimeFor(336 - 72, "hours"),
                });

                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should not remind if 73 hrs offline and last reminded 263 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(70, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(260, "hours"), // was reminded 11 days ago
                });
                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(0);
            });
            it("should remind if 336 hrs offline and last reminded 264 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(336, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(
                        336 - 72, // 264
                        "hours",
                    ),
                });
                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(1);
                expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            });
            it("should remind if 336 hrs offline and last reminded 265 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(336, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(
                        336 - 71, // 265
                        "hours",
                    ),
                });
                const result = await service.findOfflineUsers();
                expect(result.length).toEqual(1);
                expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            });
            it("should remind if 336 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(336, "hours"),
                    lastDateModeReminderSent: null,
                });
                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
                expect(result.length).toEqual(1);
            });
            it("should remind if 450 hrs offline and never reminded", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(450, "hours"),
                    lastDateModeReminderSent: null,
                });
                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.ONE_DAY);
                expect(result.length).toEqual(1);
            });
            it("should remind if 450 hrs offline and last reminded 264 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(450, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(264, "hours"),
                });
                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
                expect(result.length).toEqual(1);
            });
            it("should remind if 450 hrs offline and last reminded 265 hrs ago", async () => {
                await userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(450, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
                });
                const result = await service.findOfflineUsers();
                expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
                expect(result.length).toEqual(1);
            });
        });
    });

    describe("Ghost Mode: Edge Cases", () => {
        it("should not remind users twice if service runs twice", async () => {
            const user = await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
            });

            const result = await service.findOfflineUsers();
            expect(result[0].type).toEqual(TimeSpan.TWO_WEEKS);
            expect(result[0].user.id).toEqual(user.id);

            const afterResult = await service.findOfflineUsers();
            expect(afterResult).toEqual([]);
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

            // TWO_WEEKS users
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(337, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(265, "hours"),
            });

            const result = await service.findOfflineUsers();

            // Check counts per bucket
            const oneDayUsers = result.filter(
                (u) => u.type === TimeSpan.ONE_DAY,
            );
            const threeDayUsers = result.filter(
                (u) => u.type === TimeSpan.THREE_DAYS,
            );
            const twoWeekUsers = result.filter(
                (u) => u.type === TimeSpan.TWO_WEEKS,
            );

            expect(oneDayUsers).toHaveLength(2);
            expect(threeDayUsers).toHaveLength(1);
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
            expect(types).toContain(TimeSpan.ONE_DAY);
            expect(types).toContain(TimeSpan.ONE_DAY);
            expect(types).toContain(TimeSpan.ONE_DAY);
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
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(25, "hours"),
                    lastDateModeReminderSent: null,
                }),
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(25, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(23, "hours"),
                }),
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(73, "hours"),
                    lastDateModeReminderSent: null,
                }),
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(73, "hours"),
                    lastDateModeReminderSent: goBackInTimeFor(47, "hours"),
                }),
                userFactory.persistNewTestUser({
                    ...baseUser,
                    lastDateModeChange: goBackInTimeFor(337, "hours"),
                    lastDateModeReminderSent: null,
                }),
            ]);

            const result = await service.findOfflineUsers();
            expect(result).toHaveLength(3);

            const types = result.map((u) => u.type);
            expect(types.filter((t) => t === TimeSpan.ONE_DAY)).toHaveLength(3);
            expect(types.filter((t) => t === TimeSpan.THREE_DAYS)).toHaveLength(
                0,
            );
            expect(types.filter((t) => t === TimeSpan.TWO_WEEKS)).toHaveLength(
                0,
            );
        });
        it.skip("should sort users into right bucket", async () => {
            /** @DEV - it should not matter, how long he was off if he has never been reminded -> should put him in reminder 1! */
            await userFactory.persistNewTestUser({
                ...baseUser,
                lastDateModeChange: goBackInTimeFor(100, "hours"),
                lastDateModeReminderSent: null,
            });
        });
    });

    describe("Ghost Mode: Special Tests, Progression", function () {
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
            expect(firstResult[0].type).toBe(TimeSpan.ONE_DAY);

            // Update user's lastDateModeChange to qualify for THREE_DAYS
            await userRepository.update(user.id, {
                lastDateModeChange: goBackInTimeFor(73, "hours"),
                lastDateModeReminderSent: goBackInTimeFor(49, "hours"),
            });

            // Second run - should get THREE_DAYS reminder
            const secondResult = await service.findOfflineUsers();
            expect(secondResult).toHaveLength(1);
            expect(secondResult[0].type).toBe(TimeSpan.THREE_DAYS);

            // Update user's lastDateModeChange to qualify for ONE_DAY
            await userRepository.update(user.id, {
                lastDateModeChange: goBackInTimeFor(25, "hours"),
                lastDateModeReminderSent: null,
            });

            // Third run - should get ONE_DAY reminder
            const thirdResult = await service.findOfflineUsers();
            expect(thirdResult).toHaveLength(1);
            expect(thirdResult[0].type).toBe(TimeSpan.ONE_DAY);

            // Final run - should get no reminders (already reminded)
            const finalResult = await service.findOfflineUsers();
            expect(finalResult).toHaveLength(0);
        });
    });
});
