import { IsEmail, IsNotEmpty } from "class-validator";

export class RequestAccountDeletionViaFormDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
