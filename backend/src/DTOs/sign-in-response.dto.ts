import { ApiProperty } from "@nestjs/swagger";
import { UserPrivateDTO } from "./user-private.dto";

export enum JwtStatus {
    JWT_INVALID = "JWT_INVALID",
    JWT_DECODE_ERROR = "JWT_DECODE_ERROR",
    JWT_CREATE_ERROR = "JWT_CREATE_ERROR",
    VALID = "VALID",
}

export class SignInResponseDTO {
    @ApiProperty({ type: "string" })
    accessToken: string;

    @ApiProperty({ type: "string" })
    refreshToken: string;

    @ApiProperty({ type: UserPrivateDTO })
    user: UserPrivateDTO;

    @ApiProperty({ type: "string" })
    status: JwtStatus;
}
