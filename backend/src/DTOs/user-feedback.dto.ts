import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, Max, MaxLength, Min } from "class-validator";

export class UserFeedbackDTO {
    @ApiProperty({ description: "The rating from 1-5." })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ description: "Optional feedback text." })
    @IsOptional()
    @MaxLength(500)
    feedbackText: string;
}

export class UserFeedbackRequestDTO {
    @ApiProperty({ description: "The rating from 1-5." })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ description: "Optional feedback text." })
    @IsOptional()
    @MaxLength(500)
    feedbackText: string;
}
