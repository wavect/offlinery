import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { UserModule } from '../../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => UserModule),
        forwardRef(() => NotificationModule),
    ],
    providers: [MatchingService],
    controllers: [MatchingController],
    exports: [MatchingService],
})
export class MatchingModule {}