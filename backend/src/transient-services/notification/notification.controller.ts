import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard"; // Assume this service exists to handle user-related operations
import { OnlyAdmin } from "@/auth/auth.guard";
import { NewEventResponseDTO } from "@/DTOs/new-event-response.dto";
import { NewEventDTO } from "@/DTOs/new-event.dto";
import { NewTestEventDTO } from "@/DTOs/new-test-event.dto";
import { StorePushTokenDTO } from "@/DTOs/store-push-token.dto";
import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
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

    @Post("admin/new-event")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Send event notifications" })
    @ApiBody({
        type: NewEventDTO,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async createNewEvent(
        @Body() eventDTO: NewEventDTO,
    ): Promise<NewEventResponseDTO> {
        return await this.notificationService.createNewEvent(eventDTO);
    }

    @Post("admin/new-test-event")
    @OnlyAdmin()
    @ApiExcludeEndpoint()
    @ApiOperation({ summary: "Send test event notifications" })
    @ApiBody({
        type: NewTestEventDTO,
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async testNewEvent(
        @Body() eventDTO: NewTestEventDTO,
    ): Promise<NewEventResponseDTO> {
        return await this.notificationService.createNewTestEvent(eventDTO);
    }
}
