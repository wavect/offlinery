import { ApiProperty } from "@nestjs/swagger";
import { UserPrivateDTO } from "./user-private.dto";

export class SignInResponseDTO {
  @ApiProperty({ type: "string" })
  accessToken: string;

  @ApiProperty({ type: UserPrivateDTO })
  user: UserPrivateDTO;
}
