import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OnlyOwnUserData, USER_ID_PARAM } from "../../auth/auth-own-data.guard"; // Assume this service exists to handle user-related operations
import { StorePushTokenDTO } from "../../DTOs/store-push-token.dto";
import { NotificationService } from "./notification.service";

@ApiTags("Push Notifications")
@Controller("api")
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @Post(`push-token/:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Store user's push token" })
    @ApiResponse({
        status: 201,
        description: "The push token has been successfully stored.",
    })
    @ApiResponse({ status: 400, description: "Bad Request." })
    @ApiResponse({ status: 401, description: "Unauthorized." })
    @ApiResponse({ status: 500, description: "Internal server error." })
    async storePushToken(
        @Param(USER_ID_PARAM) userId: string,
        @Body() storePushTokenDto: StorePushTokenDTO,
    ) {
        try {
            await this.notificationService.storePushToken(
                userId,
                storePushTokenDto,
            );
            return {
                statusCode: HttpStatus.CREATED,
                message: "Push token stored successfully",
            };
        } catch (error) {
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
