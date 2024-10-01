import { ApiProperty } from "@nestjs/swagger";

export abstract class EmailCodeResponseADTO {
    @ApiProperty({
        description:
            "The timeout when the user can resend a verification code in milliseconds.",
    })
    timeout: number;

    @ApiProperty({
        description: "Timestamp when the verification code was issued.",
    })
    codeIssuedAt: Date;
}
