import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { DateRangeDTO } from "@/DTOs/date-range.dto";
import { EncounterPublicDTO } from "@/DTOs/encounter-public.dto";
import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
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
}
