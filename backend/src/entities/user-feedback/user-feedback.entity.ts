import { UserFeedbackDTO } from "@/DTOs/user-feedback.dto";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import { Column, Entity } from "typeorm";

@Entity()
export class UserFeedback implements IEntityToDTOInterface<UserFeedbackDTO> {
    convertToPublicDTO(): UserFeedbackDTO {
        return {
            deletionToken: this.deletionToken,
            feedbackText: this.feedbackText,
            rating: this.rating,
        };
    }

    @Column()
    rating: number;

    @Column()
    feedbackText?: string;

    @Column({ unique: true, primary: true })
    deletionToken: string;
}
