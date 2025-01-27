import { GhostModeReminderCronJob } from "@/cronjobs/ghostmode-reminder.cron";
import { User } from "@/entities/user/user.entity";
import { NotificationService } from "@/transient-services/notification/notification.service";
import { EDateMode, ELanguage } from "@/types/user.types";
import { MailerService } from "@nestjs-modules/mailer";
import { Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { I18nService } from "nestjs-i18n";
import { Repository } from "typeorm";

describe("GhostModeReminderCronJob", () => {
    let service: GhostModeReminderCronJob;
    let userRepository: Repository<User>;
    let notificationService: NotificationService;
    let mailerService: MailerService;
    let queryBuilder: any;

    const mockUsers = [
        {
            id: 1,
            email: "test@example.com",
            firstName: "Test",
            dateMode: EDateMode.GHOST,
            preferredLanguage: ELanguage.en,
            pushToken: "push-token-1",
            lastDateModeChange: new Date(Date.now() - 25 * 60 * 60 * 1000),
            lastDateModeReminderSent: null,
        },
    ];

    beforeEach(async () => {
        // Reset mock responses for each test
        const mockQueryResponses = {
            "24h": [],
            "72h": [],
            "336h": [],
        };

        // Create the query builder with proper method chaining
        const createMockQueryBuilder = () => {
            const qb = {
                select: jest.fn(),
                where: jest.fn(),
                andWhere: jest.fn(),
                take: jest.fn(),
                skip: jest.fn(),
                getMany: jest.fn(),
                update: jest.fn(),
                set: jest.fn(),
                execute: jest.fn(),
                whereInIds: jest.fn(),
            };

            // Make each method return the query builder for chaining
            qb.select.mockReturnValue(qb);
            qb.update.mockReturnValue(qb);
            qb.set.mockReturnValue(qb);
            qb.whereInIds.mockReturnValue(qb);
            qb.execute.mockResolvedValue({ affected: 1 }); // Default mock response
            qb.where.mockReturnValue(qb);
            qb.andWhere.mockReturnValue(qb);
            qb.take.mockReturnValue(qb);
            qb.skip.mockReturnValue(qb);
            qb.getMany.mockImplementation(async () => {
                const whereCall =
                    qb.where.mock.calls[qb.where.mock.calls.length - 1];
                if (whereCall && whereCall[0].includes("24"))
                    return mockQueryResponses["24h"];
                if (whereCall && whereCall[0].includes("72"))
                    return mockQueryResponses["72h"];
                if (whereCall && whereCall[0].includes("336"))
                    return mockQueryResponses["336h"];
                return [];
            });

            return qb;
        };

        queryBuilder = createMockQueryBuilder();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GhostModeReminderCronJob,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        createQueryBuilder: jest
                            .fn()
                            .mockReturnValue(queryBuilder),
                        update: jest.fn().mockResolvedValue({ affected: 1 }),
                    },
                },
                {
                    provide: NotificationService,
                    useValue: {
                        sendPushNotifications: jest
                            .fn()
                            .mockResolvedValue([{ status: "ok", id: "1" }]), // Mock array return
                    },
                },
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: I18nService,
                    useValue: {
                        translate: jest
                            .fn()
                            .mockResolvedValue("translated text"),
                        t: jest.fn().mockReturnValue("translated text"),
                    },
                },
            ],
        }).compile();

        service = module.get<GhostModeReminderCronJob>(
            GhostModeReminderCronJob,
        );
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        notificationService =
            module.get<NotificationService>(NotificationService);
        mailerService = module.get<MailerService>(MailerService);

        // Suppress logger output during tests
        jest.spyOn(Logger.prototype, "debug").mockImplementation(
            () => undefined,
        );
        jest.spyOn(Logger.prototype, "warn").mockImplementation(
            () => undefined,
        );
        jest.spyOn(Logger.prototype, "error").mockImplementation(
            () => undefined,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should process ghost mode users and send notifications", async () => {
        // Set up mock responses for this specific test
        queryBuilder.getMany
            .mockResolvedValueOnce([mockUsers[0]]) // 24h users
            .mockResolvedValueOnce([]) // no more 24h users
            .mockResolvedValueOnce([]) // 72h users
            .mockResolvedValueOnce([]); // 336h users;

        await service.checkGhostModeUsers();

        expect(userRepository.createQueryBuilder).toHaveBeenCalled();

        expect(mailerService.sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                to: mockUsers[0].email,
                template: "ghostmode-reminder",
                context: expect.objectContaining({
                    firstName: mockUsers[0].firstName,
                }),
            }),
        );

        expect(notificationService.sendPushNotifications).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    to: mockUsers[0].pushToken,
                    sound: "default",
                    title: expect.any(String),
                    body: expect.any(String),
                }),
            ]),
        );
    });

    it("should handle errors during user processing", async () => {
        const error = new Error("Failed to send email");
        queryBuilder.getMany.mockResolvedValueOnce([mockUsers[0]]);
        jest.spyOn(mailerService, "sendMail").mockImplementationOnce(() =>
            Promise.reject(error),
        );

        await service.checkGhostModeUsers();

        expect(Logger.prototype.error).toHaveBeenCalledWith(
            expect.stringContaining("Failed to process user"),
        );
    });
});
