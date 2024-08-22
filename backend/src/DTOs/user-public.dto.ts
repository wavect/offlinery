import { ApiProperty } from '@nestjs/swagger';

// TODO: The public DTO might need to be further trimmed for GDPR
export class UserPublicDTO {
    @ApiProperty({ description: 'The unique identifier of the user' })
    id: string;

    @ApiProperty({ description: 'The first name of the user' })
    firstName: string;

    @ApiProperty({ description: 'Age of user' })
    age: number;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'string',
        },
        description: 'An array of image uris',
        maxItems: 6
    })
    imageURIs: string[];

    @ApiProperty({ description: 'The user\'s bio' })
    bio: string;

    @ApiProperty({ description: 'The user\'s trust score' })
    trustScore?: number;
}