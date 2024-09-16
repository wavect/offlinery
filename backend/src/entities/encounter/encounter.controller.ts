import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import { GetLocationOfEncounterResponseDTO } from "@/DTOs/get-location-of-encounter-response.dto";
import { GetLocationOfEncounterDTO } from "@/DTOs/get-location-of-encounter.dto";
import { PushMessageDTO } from "@/DTOs/push-message.dto";
import { UpdateEncounterStatusDTO } from "@/DTOs/update-encounter-status.dto";
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
} from "@nestjs/common";
import {
    ApiBody,
    ApiOperation,
    ApiParam,
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
    constructor(private readonly encounterService: EncounterService) {}

    @Get(`user/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get encounters of a user within a date range" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({
        type: DateRangeDTO,
        description: "date range DTO for filtering",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async getEncountersByUser(
        @Param(USER_ID_PARAM) userId: string,
        @Body() dateRange: DateRangeDTO,
    ): Promise<EncounterPublicDTO[]> {
        const encounters = await this.encounterService.findEncountersByUser(
            userId,
            dateRange,
        );
        if (!encounters || encounters.length === 0) {
            throw new NotFoundException(
                `Encounters from user ID ${userId} not found in the specified date range`,
            );
        }
        return encounters.map((e) => e.convertToPublicDTO());
    }

    @Put(`:${USER_ID_PARAM}/status`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Update encounter status" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: UpdateEncounterStatusDTO })
    @ApiResponse({
        status: 200,
        type: EncounterPublicDTO,
        description: "Encounter status updated successfully.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async updateStatus(
        @Param(USER_ID_PARAM) userId: string,
        @Body() updateStatusDTO: UpdateEncounterStatusDTO,
    ): Promise<EncounterPublicDTO> {
        const updatedEncounter = await this.encounterService.updateStatus(
            userId,
            updateStatusDTO,
        );
        return updatedEncounter.convertToPublicDTO();
    }

    @Post(`:${USER_ID_PARAM}/message`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Push a new message to the encounter" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: PushMessageDTO })
    @ApiResponse({
        status: 201,
        type: EncounterPublicDTO,
        description: "Message added successfully.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async pushMessage(
        @Param(USER_ID_PARAM) userId: string,
        @Body() pushMessageDTO: PushMessageDTO,
    ): Promise<EncounterPublicDTO> {
        const updatedEncounter = await this.encounterService.pushMessage(
            userId,
            pushMessageDTO,
        );
        return updatedEncounter.convertToPublicDTO();
    }

    @Get(`:${USER_ID_PARAM}/encounterLocation`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get current location of encounter." })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiBody({ type: GetLocationOfEncounterDTO })
    @ApiResponse({
        status: 201,
        type: GetLocationOfEncounterResponseDTO,
        description: "Location of encounter.",
    })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async getLocationOfEncounter(
        @Param(USER_ID_PARAM) userId: string,
        @Body() getLocationOfEncounterDTO: GetLocationOfEncounterDTO,
    ): Promise<GetLocationOfEncounterResponseDTO> {
        return this.encounterService.getLocationOfEncounter(
            userId,
            getLocationOfEncounterDTO,
        );
    }
}
