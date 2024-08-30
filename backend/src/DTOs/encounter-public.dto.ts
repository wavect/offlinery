import { ApiProperty } from "@nestjs/swagger";
import { EEncounterStatus } from "../types/user.types";
import { UserPublicDTO } from "./user-public.dto";

export class EncounterPublicDTO {
    @ApiProperty({ description: "The unique identifier of the encounter" })
    id: string;

    @ApiProperty({
        enum: EEncounterStatus,
        description: "The status of the encounter",
    })
    status: EEncounterStatus;

    @ApiProperty({
        type: "string",
        format: "time",
        description: "The date time they were nearby last time.",
    })
    lastDateTimePassedBy: Date;

    @ApiProperty({
        nullable: true,
        description: "Last rough location passed by",
    })
    lastLocationPassedBy?: string;

    @ApiProperty({
        description: "Has this encounter been reported by any of the users",
    })
    reported: boolean;

    @ApiProperty({
        type: [UserPublicDTO],
        description: "Users that were nearby",
    })
    users: UserPublicDTO[];
}
