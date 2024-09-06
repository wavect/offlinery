import { EEncounterStatus } from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsUUID } from "class-validator";

export class UpdateEncounterStatusDTO {
    @ApiProperty({
        enum: EEncounterStatus,
        description: "New encounter status",
    })
    @IsEnum(EEncounterStatus)
    status: EEncounterStatus;

    @ApiProperty({ description: "Encounter ID" })
    @IsUUID()
    encounterId: string;
}
