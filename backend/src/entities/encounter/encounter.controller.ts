import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth.guard";
import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import { GenericStatusDTO } from "@/DTOs/generic-status.dto";
import { GetLocationOfEncounterResponseDTO } from "@/DTOs/get-location-of-encounter-response.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Put,
    Query,
} from "@nestjs/common";
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { EncounterService } from "./encounter.service";

@ApiTags("Encounter")
@Controller({
    version: "1",
    path: "encounter",
})
export class EncounterController {
    private readonly logger = new Logger(EncounterController.name);
    static ENCOUNTER_ID_PARAM = "encounterId";

    constructor(private readonly encounterService: EncounterService) {}

    @Get(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get encounters of a user within a date range" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiQuery({
        name: "startDate",
        required: true,
        type: Date,
        description: "Start date for filtering",
    })
    @ApiQuery({
        name: "endDate",
        required: true,
        type: Date,
        description: "End date for filtering",
    })
    @ApiResponse({ status: 404, description: "User not found" })
    async getEncountersByUser(
        @Param(USER_ID_PARAM) userId: string,
        @Query("startDate") startDate: Date,
        @Query("endDate") endDate: Date,
    ): Promise<EncounterPublicDTO[]> {
        return this.encounterService.getEncountersByUser(
            userId,
            startDate,
            endDate,
        );
    }

    @Put(`:${USER_ID_PARAM}/status`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Update encounter status" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: UpdateEncounterStatusDTO })
    @ApiResponse({
        status: 200,
        type: GenericStatusDTO,
        description: "Encounter status updated successfully.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async updateStatus(
        @Param(USER_ID_PARAM) userId: string,
        @Body() updateStatusDTO: UpdateEncounterStatusDTO,
    ): Promise<GenericStatusDTO> {
        const updatedEncounter = await this.encounterService.updateStatus(
            userId,
            updateStatusDTO,
        );
        return {
            success: !!updatedEncounter,
            info: "Tried to update encounter status.",
        };
    }

    @Post(`:${USER_ID_PARAM}/message`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Push a new message to the encounter" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: PushMessageDTO })
    @ApiResponse({
        status: 201,
        type: GenericStatusDTO,
        description: "Message added successfully.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async pushMessage(
        @Param(USER_ID_PARAM) userId: string,
        @Body() pushMessageDTO: PushMessageDTO,
    ): Promise<GenericStatusDTO> {
        const updatedEncounter = await this.encounterService.pushMessage(
            userId,
            pushMessageDTO,
        );
        return {
            success: !!updatedEncounter,
            info: "Tried to save message to other user.",
        };
    }

    @Get(
        `:${EncounterController.ENCOUNTER_ID_PARAM}/encounterLocation/:${USER_ID_PARAM}`,
    )
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get current location of encounter." })
    @ApiParam({
        name: EncounterController.ENCOUNTER_ID_PARAM,
        type: "string",
        description: "Encounter ID",
    })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiResponse({
        status: 201,
        type: GetLocationOfEncounterResponseDTO,
        description: "Location of encounter.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async getLocationOfEncounter(
        @Param(USER_ID_PARAM) userId: string,
        @Param(EncounterController.ENCOUNTER_ID_PARAM) encounterId: string,
    ): Promise<GetLocationOfEncounterResponseDTO> {
        return this.encounterService.getLocationOfEncounter(
            userId,
            encounterId,
        );
    }
}
