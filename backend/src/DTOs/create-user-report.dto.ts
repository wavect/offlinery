import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import { EIncidentType } from "../types/user.types";

export class CreateUserReportDTO {
    @ApiProperty({
        description: "The description of the incident",
        example: "The user was being disrespectful in chat",
    })
    @IsString()
    incidentDescription: string;

    @ApiProperty({
        description:
            "Whether to keep the reporter updated on the report status",
        example: true,
    })
    @IsBoolean()
    keepReporterInTheLoop: boolean;

    @ApiProperty({
        description: "The type of incident",
        enum: EIncidentType,
        example: EIncidentType.Disrespectful,
    })
    @IsEnum(EIncidentType)
    incidentType: EIncidentType;

    @ApiProperty({
        description: "The ID of the user being reported",
    })
    @IsString()
    encounterId: string;
}
