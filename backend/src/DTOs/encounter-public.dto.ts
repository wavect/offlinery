import { MessagePublicDTO } from "@/DTOs/message-public.dto";
import { EEncounterStatus } from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";
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
        type: "string",
        description: "Last rough location passed by",
    })
    lastLocationPassedBy?: string;

    @ApiProperty({
        description: "Has this encounter been reported by any of the users",
    })
    reported: boolean;

    @ApiProperty({
        type: UserPublicDTO,
        description: "Other Users that was nearby",
    })
    otherUser: UserPublicDTO;

    @ApiProperty({
        type: [MessagePublicDTO],
        description: "User messages",
        nullable: true,
    })
    messages: MessagePublicDTO[];

    @ApiProperty({ default: null })
    isNearbyRightNow: boolean | null;
}
