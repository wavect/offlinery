import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserFeedbackController } from "./user-feedback.controller";
import { UserFeedback } from "./user-feedback.entity";
import { UserFeedbackService } from "./user-feedback.service";

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([UserFeedback])],
    providers: [UserFeedbackService],
    controllers: [UserFeedbackController],
})
export class UserFeedbackModule {}
