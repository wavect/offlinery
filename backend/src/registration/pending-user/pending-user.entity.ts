import { EEmailVerificationStatus } from "@/types/user.types";
import { PendingUserPublicDTO } from "src/DTOs/pending-user.dto";
import { IEntityToDTOInterface } from "src/interfaces/IEntityToDTO.interface";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PendingUser
    implements IEntityToDTOInterface<PendingUserPublicDTO>
{
    convertToPublicDTO(): PendingUserPublicDTO {
        return {
            id: this.id,
            email: this.email,
            verificationStatus: this.verificationStatus,
        };
    }
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    verificationStatus: EEmailVerificationStatus;

    @Column()
    verificationCode: string;

    @Column({ type: "timestamptz" })
    verificationCodeIssuedAt: Date;
}
