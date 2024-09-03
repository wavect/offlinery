import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { User } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) {}

    async signInWithJWT(accessToken: string): Promise<SignInResponseDTO> {
        const userJwtRes: Pick<User, "id"> = await this.jwtService.verifyAsync(
            accessToken,
            {
                secret: TYPED_ENV.JWT_SECRET,
            },
        );
        const user: User = await this.usersService.findUserById(userJwtRes.id);
        if (!user) {
            throw new UnauthorizedException();
        }
        return {
            accessToken,
            user: user.convertToPrivateDTO(),
        };
    }

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
        return {
            accessToken: await this.jwtService.signAsync(payload),
            user: user.convertToPrivateDTO(),
        };
    }
}
