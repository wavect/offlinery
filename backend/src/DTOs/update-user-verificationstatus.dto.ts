import { EVerificationStatus } from "@/types/user.types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class UpdateUserVerificationstatusDTO {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: "New verification status",
        enum: EVerificationStatus,
    })
    newVerificationStatus: EVerificationStatus;
}
