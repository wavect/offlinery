import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class DateRangeDTO {
    @ApiPropertyOptional({ description: "Start date for filtering" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiPropertyOptional({ description: "End date for filtering" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;
}
