import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth.guard"; // Assume this service exists to handle user-related operations
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";

@ApiTags("Push Notifications")
@Controller({
    version: "1",
    path: "notification",
})
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @Post(`push-token/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    async storePushToken(
        @Param(USER_ID_PARAM) userId: string,
        @Body() storePushTokenDTO: StorePushTokenDTO,
    ) {
        try {
            await this.notificationService.storePushToken(
                userId,
                storePushTokenDTO,
            );
            return {
                statusCode: HttpStatus.CREATED,
                message: "Push token stored successfully",
            };
        } catch (error) {
            console.log("hallo");
            // Log the error here
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Failed to store push token",
                    error: "Internal Server Error",
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
