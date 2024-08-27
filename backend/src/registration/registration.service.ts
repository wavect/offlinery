import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EVerificationStatus } from 'src/types/user.types';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PendingUser } from './pending-user/pending-user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RegistrationService {
  emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  constructor(
    @InjectRepository(PendingUser)
    private pendingUserRepo: Repository<PendingUser>,
    private readonly mailService: MailerService,
  ) {}

  public async registerPendingUser(email: string): Promise<string> {
    try {
      const existingUser = await this.pendingUserRepo.findOneBy({ email });
      if (existingUser) {
        throw new Error('Email already exists.');
      }

      const pendingUser = new PendingUser();
      pendingUser.email = email;
      pendingUser.verificationStatus = EVerificationStatus.PENDING;

      let verificationNumber: string = '';
      for (let index = 0; index <= 5; index++) {
        const randomNumber = Math.floor(Math.random() * (9 - 0) + 0).toString();

        verificationNumber = verificationNumber.concat(randomNumber);
      }

      pendingUser.verificationCode = verificationNumber;
      await this.pendingUserRepo.save(pendingUser);

      await this.sendMail(pendingUser.email, verificationNumber);

      return pendingUser.email;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async verifyEmail(email: string, code: string): Promise<void> {
    try {
      const user = await this.pendingUserRepo.findOneByOrFail({
        email: email,
        verificationCode: code,
      });

      user.verificationStatus = EVerificationStatus.VERIFIED;
      await this.pendingUserRepo.save(user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async sendMail(to: string, verificationCode: string) {
    try {
      const text = `Thank you for registering! Here is your verification code: ${verificationCode}.`;

      await this.mailService.sendMail({
        from: 'Offlinery <offlinery@noreply.com>',
        to,
        subject: 'Offlinery Verification Code',
        text,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
