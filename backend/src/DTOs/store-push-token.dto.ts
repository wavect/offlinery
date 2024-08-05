import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class StorePushTokenDto {
    @ApiProperty({
        description: 'The unique identifier of the user',
        example: 'user123'
    })
    @IsString()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({
        description: 'The Expo push token for the user\'s device',
        example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'
    })
    @IsString()
    @IsNotEmpty()
    pushToken: string;
}