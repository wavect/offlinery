import { UserFeedbackDTO } from "@/DTOs/user-feedback.dto";
import { BaseEntity } from "@/entities/base.entity";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { Column, Entity } from "typeorm";

@Entity()
export class UserFeedback
    extends BaseEntity
    implements IEntityToDTOInterface<UserFeedbackDTO>
{
    convertToPublicDTO(): UserFeedbackDTO {
        return {
            feedbackText: this.feedbackText,
            rating: this.rating,
        };
    }

    @Column()
    rating: number;

    @Column()
    feedbackText?: string;
}
