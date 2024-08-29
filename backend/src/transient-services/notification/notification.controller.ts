import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { StorePushTokenDTO } from "../../DTOs/store-push-token.dto";
import { UserService } from "../../user/user.service"; // Assume this service exists to handle user-related operations

@ApiTags("Push Notifications")
@Controller("api")
export class NotificationController {
  constructor(private readonly userService: UserService) {}

  @Post("push-token")
  @ApiOperation({ summary: "Store user's push token" })
  @ApiResponse({
    status: 201,
    description: "The push token has been successfully stored.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 500, description: "Internal server error." })
  async storePushToken(@Body() storePushTokenDto: StorePushTokenDTO) {
    try {
      await this.userService.updatePushToken(
        storePushTokenDto.userId,
        storePushTokenDto.pushToken,
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
