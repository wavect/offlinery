import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationController } from './registration.controller';
import { PendingUserService } from './pending-user/pending-user.service';
import { PendingUser } from './pending-user/pending-user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { TYPED_ENV } from 'src/utils/env.utils';
import { User } from 'src/user/user.entity';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingUser, User]),
    MailerModule.forRoot({
      transport: {
        host: TYPED_ENV.EMAIL_HOST,
        auth: {
          user: TYPED_ENV.EMAIL_USERNAME,
          pass: TYPED_ENV.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@offlinery.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
      },
    }),
  ],
  providers: [RegistrationService, PendingUserService],
  controllers: [RegistrationController],
  exports: [RegistrationService, PendingUserService],
})
export class RegistrationModule {}
