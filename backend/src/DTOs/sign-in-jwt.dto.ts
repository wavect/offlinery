import { ApiProperty } from "@nestjs/swagger";

export class SignInJwtDTO {
    @ApiProperty({ type: "string" })
    jwtAccessToken: string;
}
