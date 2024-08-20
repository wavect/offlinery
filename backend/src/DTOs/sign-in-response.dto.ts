import {ApiProperty} from "@nestjs/swagger";

export class SignInResponseDTO {
    @ApiProperty({type: 'string'})
    access_token: string;
}