import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInResponseDTO } from '../DTOs/sign-in-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    clearPassword: string,
  ): Promise<SignInResponseDTO> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    /** The passwordSalt is not used in the signIn method. This is because the bcrypt.compare() function already
     * takes care of verifying the password using the stored passwordHash and the original salt. */
    const isPasswordValid = await bcrypt.compare(
      clearPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    console.log("user: ", user.convertToPrivateDTO())
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: user.convertToPrivateDTO(),
    };
  }
}
