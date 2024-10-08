import { UserFeedbackRequestDTO } from "@/DTOs/user-feedback.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserFeedback } from "./user-feedback.entity";

@Injectable()
export class UserFeedbackService {
    constructor(
        @InjectRepository(UserFeedback)
        private readonly userFeedbackRepo: Repository<UserFeedback>,
    ) {}
    async createUserFeedback(feedback: UserFeedbackRequestDTO) {
        const newFeedback = this.userFeedbackRepo.create(feedback);
        return await this.userFeedbackRepo.save(newFeedback);
    }
}
