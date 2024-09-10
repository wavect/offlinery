import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { EncounterService } from "@/entities/encounter/encounter.service";
import { Message } from "@/entities/messages/message.entity";
import { User } from "@/entities/user/user.entity";
import { EEncounterStatus } from "@/types/user.types";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

describe("EncounterService", () => {
    let service: EncounterService;
    let encounterRepository: Repository<Encounter>;
    let messageRepository: Repository<Message>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EncounterService,
                {
                    provide: getRepositoryToken(Encounter),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Message),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<EncounterService>(EncounterService);
        encounterRepository = module.get<Repository<Encounter>>(
            getRepositoryToken(Encounter),
        );
        messageRepository = module.get<Repository<Message>>(
            getRepositoryToken(Message),
        );
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("findEncountersByUser", () => {
        it("should return encounters for a user within a date range", async () => {
            const mockQueryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };
            jest.spyOn(
                encounterRepository,
                "createQueryBuilder",
            ).mockReturnValue(mockQueryBuilder as any);

            const userId = "user123";
            const dateRange = {
                startDate: new Date("2023-01-01"),
                endDate: new Date("2023-12-31"),
            };

            await service.findEncountersByUser(userId, dateRange);

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                "user.id = :userId",
                { userId },
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                "encounter.lastDateTimePassedBy BETWEEN :startDate AND :endDate",
                expect.any(Object),
            );
        });
    });

    describe("saveEncountersForUser", () => {
        it("should save encounters for a user", async () => {
            const userToBeApproached = new User();
            userToBeApproached.id = "user1";
            const usersThatWantToApproach = [new User(), new User()];
            usersThatWantToApproach[0].id = "user2";
            usersThatWantToApproach[1].id = "user3";

            jest.spyOn(encounterRepository, "findOne").mockResolvedValue(null);
            jest.spyOn(encounterRepository, "save").mockResolvedValue(
                {} as Encounter,
            );

            await service.saveEncountersForUser(
                userToBeApproached,
                usersThatWantToApproach,
                true,
                false,
            );

            expect(encounterRepository.save).toHaveBeenCalledTimes(2);
        });
    });

    describe("updateStatus", () => {
        it("should update the status of an encounter", async () => {
            const userId = "user123";
            const updateStatusDTO: UpdateEncounterStatusDTO = {
                encounterId: "encounter123",
                status: EEncounterStatus.MET_INTERESTED,
            };
            const mockEncounter = new Encounter();
            mockEncounter.userStatuses = {};

            jest.spyOn(encounterRepository, "findOneBy").mockResolvedValue(
                mockEncounter,
            );
            jest.spyOn(encounterRepository, "save").mockResolvedValue(
                mockEncounter,
            );

            const result = await service.updateStatus(userId, updateStatusDTO);

            expect(result.userStatuses[userId]).toBe(
                EEncounterStatus.MET_INTERESTED,
            );
            expect(encounterRepository.save).toHaveBeenCalledWith(
                mockEncounter,
            );
        });

        it("should throw NotFoundException if encounter is not found", async () => {
            jest.spyOn(encounterRepository, "findOneBy").mockResolvedValue(
                null,
            );

            await expect(
                service.updateStatus("user123", {
                    encounterId: "nonexistent",
                    status: EEncounterStatus.MET_NOT_INTERESTED,
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("pushMessage", () => {
        it("should add a new message to an encounter", async () => {
            const userId = "user123";
            const pushMessageDTO = {
                encounterId: "encounter123",
                content: "Hello!",
            };
            const mockEncounter = new Encounter();
            mockEncounter.messages = [];

            jest.spyOn(encounterRepository, "findOne").mockResolvedValue(
                mockEncounter,
            );
            jest.spyOn(messageRepository, "create").mockReturnValue(
                {} as Message,
            );
            jest.spyOn(messageRepository, "save").mockResolvedValue(
                {} as Message,
            );
            jest.spyOn(encounterRepository, "save").mockResolvedValue(
                mockEncounter,
            );

            const result = await service.pushMessage(userId, pushMessageDTO);

            expect(messageRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: "Hello!",
                    sender: { id: userId },
                    encounter: mockEncounter,
                }),
            );
            expect(messageRepository.save).toHaveBeenCalled();
            expect(encounterRepository.save).toHaveBeenCalledWith(
                mockEncounter,
            );
            expect(result.messages.length).toBe(1);
        });

        it("should throw NotFoundException if encounter is not found", async () => {
            jest.spyOn(encounterRepository, "findOne").mockResolvedValue(null);

            await expect(
                service.pushMessage("user123", {
                    encounterId: "nonexistent",
                    content: "Hello!",
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
