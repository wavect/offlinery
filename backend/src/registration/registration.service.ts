import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EVerificationStatus } from "src/types/user.types";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { PendingUser } from "./pending-user/pending-user.entity";

@Injectable()
export class RegistrationService {
  readonly VERIFICATION_CODE_EXPIRATION_IN_MIN = 15;

  constructor(
    @InjectRepository(PendingUser)
    private pendingUserRepo: Repository<PendingUser>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly mailService: MailerService,
  ) {}

  public async registerPendingUser(email: string): Promise<string> {
    try {
      const existingPendingUser = await this.pendingUserRepo.findOneBy({
        email,
        verificationStatus:
          EVerificationStatus.VERIFIED || EVerificationStatus.NOT_NEEDED,
      });
      const existingVerifiedUser = await this.userRepo.findOneBy({ email });

      if (existingPendingUser || existingVerifiedUser) {
        throw new Error("Email already exists.");
      }

      let pendingUser = await this.pendingUserRepo.findOneBy({ email });

      if (!pendingUser) {
        pendingUser = new PendingUser();
        pendingUser.email = email;
        pendingUser.verificationStatus = EVerificationStatus.PENDING;
      }

      pendingUser.verificationCodeIssuedAt = new Date();

      let verificationNumber: string = "";
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

      const currentTime = new Date().getTime();
      const issuedTime = user.verificationCodeIssuedAt.getTime();

      const expirationTimeInMs =
        this.VERIFICATION_CODE_EXPIRATION_IN_MIN * 60 * 1000;

      if (currentTime - issuedTime > expirationTimeInMs) {
        throw new Error("Verification code has expired.");
      }

      user.verificationStatus = EVerificationStatus.VERIFIED;
      await this.pendingUserRepo.save(user);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async sendMail(to: string, verificationCode: string) {
    try {
      await this.mailService.sendMail({
        to,
        subject: "Welcome to Offlinery! Confirm your Email",
        template: "../../mail/templates/email-verification.hbs",
        context: {
          name: to,
          verificationCode,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
