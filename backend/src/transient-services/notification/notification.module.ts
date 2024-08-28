import { Module } from "@nestjs/common";
import { UserModule } from "../../user/user.module";
import { NotificationController } from "./notification.controller";

@Module({
  imports: [UserModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
