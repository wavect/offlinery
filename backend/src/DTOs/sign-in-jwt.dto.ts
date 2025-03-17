import { ApiProperty } from "@nestjs/swagger";

export class SignInJwtDTO {
    @ApiProperty({ type: "string" })
    jwtAccessToken: string;
}

export class RefreshJwtDTO {
    @ApiProperty({ type: "string" })
    refreshToken: string;
}
