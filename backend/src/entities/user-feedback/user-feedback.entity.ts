import { UserFeedbackDTO } from "@/DTOs/user-feedback.dto";
import { IEntityToDTOInterface } from "@/interfaces/IEntityToDTO.interface";
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class UserFeedback implements IEntityToDTOInterface<UserFeedbackDTO> {
    convertToPublicDTO(): UserFeedbackDTO {
        return {
            feedbackText: this.feedbackText,
            rating: this.rating,
        };
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    rating: number;

    @Column()
    feedbackText?: string;

    @CreateDateColumn()
    created: Date;
}
