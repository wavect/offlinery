import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { RegistrationController } from './registration.controller';
import { PendingUserService } from './pending-user/pending-user.service';
import { PendingUser } from './pending-user/pending-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PendingUser])],
  providers: [RegistrationService, PendingUserService],
  controllers: [RegistrationController],
  exports: [RegistrationService, PendingUserService],
})
export class RegistrationModule {}
