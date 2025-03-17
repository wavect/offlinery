import { MessagePublicDTO } from "@/DTOs/message-public.dto";
import { BaseEntity } from "@/entities/base.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { User } from "@/entities/user/user.entity";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Message
    extends BaseEntity
    implements IEntityToDTOInterface<MessagePublicDTO>
{
    public convertToPublicDTO(): MessagePublicDTO {
        return {
            id: this.id,
            content: this.content,
            sentAt: this.sentAt,
            senderUserId: this.sender.id,
        };
    }

    @Column("text")
    content: string;

    @Column({ type: "timestamptz" })
    sentAt: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    sender: User;

    @ManyToOne(() => Encounter, (encounter) => encounter.messages)
    encounter: Encounter;
}
