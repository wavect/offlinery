import { ApiProperty } from '@nestjs/swagger';
import {UserPublicDTO} from "./user-public.dto";
import {EEncounterStatus} from "../types/user.types";

export class UserEncounterDTO {
    @ApiProperty({ description: 'The unique identifier of the encounter NOT the user' })
    id: string;

    @ApiProperty({ type: UserPublicDTO, description: 'The user you might have met.' })
    encounterProfile: UserPublicDTO

    @ApiProperty({ description: 'Was user nearby when querying the encounter' })
    isNearbyRightNow: boolean

    @ApiProperty({ type: 'string', format: 'date', description: 'When were the user and encounter nearby?' })
    lastDateTimePassedBy: Date; // use timestamp over string for localization & avoiding re-fetch/more dynamic client-side refresh

    @ApiProperty({ description: 'Where approximately were they nearby?', example: "Altstadt Innsbruck" })
    lastLocationPassedBy: string; // no coordinates etc. on purpose

    @ApiProperty({enum: EEncounterStatus, description: 'Did they meet? Also indicates interest.'})
    status: EEncounterStatus

    @ApiProperty({ description: 'Did this user report this encounter?' })
    reported: boolean
}