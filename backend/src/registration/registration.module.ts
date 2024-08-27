import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationController } from './registration.controller';
import { PendingUserService } from './pending-user/pending-user.service';
import { PendingUser } from './pending-user/pending-user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { TYPED_ENV } from 'src/utils/env.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingUser]),
    MailerModule.forRoot({
      transport: {
        host: TYPED_ENV.EMAIL_HOST,
        auth: {
          user: TYPED_ENV.EMAIL_USERNAME,
          pass: TYPED_ENV.EMAIL_PASSWORD,
        },
      },
    }),
  ],
  providers: [RegistrationService, PendingUserService],
  controllers: [RegistrationController],
  exports: [RegistrationService, PendingUserService],
})
export class RegistrationModule {}
