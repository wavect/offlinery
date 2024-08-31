import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OnlyOwnUserData, USER_ID_PARAM } from "../auth/auth-own-data.guard";
import { EncounterPublicDTO } from "../DTOs/encounter-public.dto";
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
    @ApiOperation({ summary: "Get encounters of a user" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    @ApiResponse({ status: 404, description: "Encounter not found." })
    async getEncountersByUser(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<EncounterPublicDTO[]> {
        const encounters =
            await this.encounterService.findEncountersByUser(userId);
        if (!encounters) {
            throw new NotFoundException(
                `Encounters from user ID ${userId} not found`,
            );
        }
        return encounters.map((e) => e.convertToPublicDTO());
    }
}
