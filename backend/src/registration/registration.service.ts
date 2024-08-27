import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EVerificationStatus } from 'src/types/user.types';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PendingUser } from './pending-user/pending-user.entity';

@Injectable()
export class RegistrationService {
  emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  constructor(
    @InjectRepository(PendingUser)
    private pendingUserRepo: Repository<PendingUser>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  public async registerPendingUser(email: string): Promise<string> {
    try {
      const existingUser = await this.userRepo.findOneBy({ email });
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

      console.log('email verification number: ', verificationNumber);

      pendingUser.verificationCode = verificationNumber;
      console.log("saving user:", pendingUser)
      await this.pendingUserRepo.save(pendingUser);

      return verificationNumber;
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
      console.log("email verified: ", user.email)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
