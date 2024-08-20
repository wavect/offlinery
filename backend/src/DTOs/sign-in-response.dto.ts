import {ApiProperty} from "@nestjs/swagger";
import {UserPrivateDTO} from "./user-private.dto";

export class SignInResponseDTO {
    @ApiProperty({type: 'string'})
    access_token: string;

    @ApiProperty({ type: UserPrivateDTO })
    user: UserPrivateDTO;
}