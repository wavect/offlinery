import { PendingUserPublicDTO } from "@/DTOs/pending-user.dto";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { EEmailVerificationStatus } from "@/types/user.types";
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

    @Column({ unique: true })
    email: string;

    @Column()
    verificationStatus: EEmailVerificationStatus;

    @Column()
    verificationCode: string;

    @Column({ type: "timestamptz" })
    verificationCodeIssuedAt: Date;

    /** @dev Sexual orientation needs dedicated prompt (explicit yes/no). */
    @Column({ type: "timestamptz", nullable: true })
    acceptedSpecialDataGenderLookingForAt?: Date;
}
