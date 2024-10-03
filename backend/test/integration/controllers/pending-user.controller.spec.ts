import { SetAcceptedSpecialDataGenderLookingForDTO } from "@/DTOs/set-accepted-special-data-gender-looking-for.dto";
import { UpdateUserVerificationstatusDTO } from "@/DTOs/update-user-verificationstatus.dto";
import { PendingUserController } from "@/entities/pending-user/pending-user.controller";
import { PendingUserService } from "@/entities/pending-user/pending-user.service";
import { EVerificationStatus } from "@/types/user.types";
import { Test, TestingModule } from "@nestjs/testing";
import { VerifyEmailDTO } from "src/DTOs/verify-email.dto";

describe("PendingUserController", () => {
    let controller: PendingUserController;
    let service: PendingUserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PendingUserController],
            providers: [
                {
                    provide: PendingUserService,
                    useValue: {
                        registerPendingUser: jest.fn(),
                        verifyEmail: jest.fn(),
                        setAcceptedSpecialDataGenderLookingForAt: jest.fn(),
                        changeVerificationStatus: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PendingUserController>(PendingUserController);
        service = module.get<PendingUserService>(PendingUserService);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    describe("verifyEmail", () => {
        it("should call verifyEmail service method", async () => {
            const dto: VerifyEmailDTO = {
                email: "test@example.com",
                verificationCode: "123456",
            };

            await controller.verifyEmail(dto);

            expect(service.verifyEmail).toHaveBeenCalledWith(
                dto.email,
                dto.verificationCode,
            );
        });
    });

    describe("setAcceptedSpecialDataGenderLookingForAt", () => {
        it("should call setAcceptedSpecialDataGenderLookingForAt service method", async () => {
            const dto: SetAcceptedSpecialDataGenderLookingForDTO = {
                email: "test@example.com",
                dateTimeAccepted: new Date(),
            };

            await controller.setAcceptedSpecialDataGenderLookingForAt(dto);

            expect(
                service.setAcceptedSpecialDataGenderLookingForAt,
            ).toHaveBeenCalledWith(dto.email, dto.dateTimeAccepted);
        });
    });

    describe("changeVerificationStatus", () => {
        it("should call changeVerificationStatus service method", async () => {
            const dto: UpdateUserVerificationstatusDTO = {
                email: "test@example.com",
                newVerificationStatus: EVerificationStatus.VERIFIED,
            };

            await controller.changeVerificationStatus(dto);

            expect(service.changeVerificationStatus).toHaveBeenCalledWith(
                dto.email,
                dto.newVerificationStatus,
            );
        });
    });
});
