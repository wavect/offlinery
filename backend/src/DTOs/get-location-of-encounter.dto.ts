import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GetLocationOfEncounterDTO {
    @ApiProperty({ description: "Encounter ID" })
    @IsUUID()
    encounterId: string;
}
