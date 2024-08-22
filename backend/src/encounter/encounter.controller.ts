import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "../user/user.entity";
import {EncounterService} from "./encounter.service";
import {EncounterPublicDTO} from "../DTOs/encounter-public.dto";

@ApiTags('Encounter')
@Controller({
    version: '1',
    path: 'encounter',
})
export class EncounterController {
    constructor(
        private readonly encounterService: EncounterService,
    ) {}

    @Get(':id')
    @ApiOperation({ summary: 'Get a encounter by ID' })
    @ApiParam({ name: 'id', type: 'number', description: 'Encounter ID' })
    @ApiResponse({ status: 200, description: 'The encounter has been successfully retrieved.', type: User })
    @ApiResponse({ status: 404, description: 'Encounter not found.' })
    async getEncounter(@Param('id') id: string): Promise<EncounterPublicDTO> {
        const encounter = await this.encounterService.findEncounterById(id);
        if (!encounter) {
            throw new NotFoundException(`Encounter with ID ${id} not found`);
        }
        return encounter.convertToPublicDTO();
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get a encounters of user' })
    @ApiParam({ name: 'id', type: 'number', description: 'Encounter ID' })
    @ApiResponse({ status: 200, description: 'The encounter has been successfully retrieved.', type: User })
    @ApiResponse({ status: 404, description: 'Encounter not found.' })
    async getEncountersByUser(@Param('userId') userId: string): Promise<EncounterPublicDTO[]> {
        const encounters = await this.encounterService.findEncountersByUser(userId);
        if (!encounters) {
            throw new NotFoundException(`Encounters from user ID ${userId} not found`);
        }
        return encounters.map(e => e.convertToPublicDTO());
    }
}
