import { Module } from '@nestjs/common';
import { PushNotificationController } from './notification.controller';
import { UserModule } from '../../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [PushNotificationController],
})
export class NotificationModule {}