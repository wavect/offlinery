import { PendingUserPublicDTO } from "@/DTOs/pending-user.dto";
import { BaseEntity } from "@/entities/base.entity";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { EEmailVerificationStatus } from "@/types/user.types";
import { Column, Entity } from "typeorm";

@Entity()
export class PendingUser
    extends BaseEntity
    implements IEntityToDTOInterface<PendingUserPublicDTO>
{
    convertToPublicDTO(): PendingUserPublicDTO {
        return {
            id: this.id,
            email: this.email,
            verificationStatus: this.verificationStatus,
        };
    }

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
