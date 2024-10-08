import { Public } from "@/auth/auth.guard";
import { UserFeedbackRequestDTO } from "@/DTOs/user-feedback.dto";
import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserFeedbackService } from "./user-feedback.service";
@ApiTags("User-Feedback")
@Controller({
    version: "1",
    path: "user-feedback",
})
export class UserFeedbackController {
    private readonly logger = new Logger(UserFeedbackController.name);
    constructor(private readonly userFeedbackService: UserFeedbackService) {}
    @Post()
    @Public()
    @ApiBody({
        type: UserFeedbackRequestDTO,
        description: "The User's feedback.",
    })
    @ApiOperation({ summary: "Create a user feedback." })
    @ApiResponse({
        status: 200,
        description: "User feedback created successfuly.",
    })
    @ApiResponse({
        status: 400,
        description: "Failed to create user feedback.",
    })
    async createUserFeedback(@Body() userFeedback: UserFeedbackRequestDTO) {
        this.logger.debug("Creating feedback...");
        await this.userFeedbackService.createUserFeedback(userFeedback);
    }
}
