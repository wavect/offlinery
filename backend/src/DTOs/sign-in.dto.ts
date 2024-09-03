import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class SignInDTO {
    @ApiProperty({ type: "string" })
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ type: "string" })
    clearPassword: string;
}
