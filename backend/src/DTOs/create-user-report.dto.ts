import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsString, IsNumber } from 'class-validator';
import {EIncidentType} from "../types/user.types";

export class CreateUserReportDTO {
    @ApiProperty({
        description: 'The description of the incident',
        example: 'The user was being disrespectful in chat',
    })
    @IsString()
    incidentDescription: string;

    @ApiProperty({
        description: 'Whether to keep the reporter updated on the report status',
        example: true,
    })
    @IsBoolean()
    keepReporterInTheLoop: boolean;

    @ApiProperty({
        description: 'The type of incident',
        enum: EIncidentType,
        example: EIncidentType.Disrespectful,
    })
    @IsEnum(EIncidentType)
    incidentType: EIncidentType;

    @ApiProperty({
        description: 'The ID of the user being reported',
    })
    @IsString()
    reportedUserId: string;

    @ApiProperty({
        description: 'The ID of the user making the report',
    })
    @IsString()
    reportingUserId: string;
}