import { ApiProperty } from "@nestjs/swagger";

export class SignInDTO {
    @ApiProperty({ type: "string" })
    email: string;

    @ApiProperty({ type: "string" })
    clearPassword: string;
}
