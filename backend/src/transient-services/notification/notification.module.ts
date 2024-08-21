import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { UserModule } from '../../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [NotificationController],
})
export class NotificationModule {}