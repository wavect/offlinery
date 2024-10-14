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
import { EncounterBuilder } from "../../_src/builders/encounter.builder";
import { MessageBuilder } from "../../_src/builders/message.builder";
import { UserBuilder } from "../../_src/builders/user.builder";
import { mockRepository } from "../../_src/utils/utils";

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
                    useValue: mockRepository,
                },
                {
                    provide: getRepositoryToken(Message),
                    useValue: mockRepository,
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

            const mockEncounter = new EncounterBuilder()
                .withUserStatuses({})
                .build();

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
        it("should add a new message to an encounter and filter out previous messages from the same user", async () => {
            const userId = "user123";
            const pushMessageDTO = {
                encounterId: "encounter123",
                content: "Hello!",
            };

            const mockEncounter = new EncounterBuilder()
                .withId("encounter123")
                .withMessages([
                    new MessageBuilder()
                        .withId("msg1")
                        .withContent("Previous message")
                        .withSender(new UserBuilder().withId(userId).build())
                        .build(),
                    new MessageBuilder()
                        .withId("msg2")
                        .withContent("Other user message")
                        .withSender(new UserBuilder().withId("other").build())
                        .build(),
                ])
                .build();

            const newMessage = new MessageBuilder()
                .withId("newMsg")
                .withContent("Hello!")
                .withSender(new UserBuilder().withId(userId).build())
                .withEncounter(mockEncounter)
                .build();

            jest.spyOn(encounterRepository, "findOne").mockResolvedValue(
                mockEncounter,
            );
            jest.spyOn(messageRepository, "create").mockReturnValue(newMessage);
            jest.spyOn(messageRepository, "save").mockResolvedValue(newMessage);
            jest.spyOn(encounterRepository, "save").mockResolvedValue({
                ...mockEncounter,
                messages: [mockEncounter.messages[1], newMessage],
            } as Encounter);

            const result = await service.pushMessage(userId, pushMessageDTO);

            expect(result.messages.length).toBe(2);
            expect(result.messages).not.toContainEqual(
                expect.objectContaining({ id: "msg1" }),
            );
            expect(result.messages).toContainEqual(
                expect.objectContaining({ id: "msg2" }),
            );
            expect(result.messages).toContainEqual(
                expect.objectContaining({ id: "newMsg" }),
            );
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
