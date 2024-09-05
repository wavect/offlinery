import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
        const refreshToken = user.refreshToken;
        if (!refreshToken) {
            console.log(
                "User migration: Has a valid JWT but no refresh. Needs new login",
            );
            return null;
        }
        console.log(
            `User signed in with existing JWT ${accessToken} and ${refreshToken}`,
        );

        console.log("returning user: ", user.convertToPrivateDTO());
        return {
            accessToken,
            refreshToken,
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
        const isPasswordValid = await bcrypt.compare(
            clearPassword,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.generateRefreshToken(user);

        console.log(`User signed in with Password, creating new JWT and AT `);
        console.log(`AT: ${!!accessToken}, RT: ${refreshToken}`);

        return {
            accessToken,
            refreshToken,
            user: user.convertToPrivateDTO(),
        };
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const refreshToken = uuidv4();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 14);

        await this.usersService.storeRefreshToken(
            user.id,
            refreshToken,
            expirationDate,
        );
        return refreshToken;
    }

    async refreshAccessToken(refreshToken: string): Promise<SignInResponseDTO> {
        try {
            console.log(
                "received refreshAccess Request from refreshToken: ",
                refreshToken,
            );
            const user =
                await this.usersService.findUserByRefreshToken(refreshToken);
            console.log("refreshing user...", !!user);
            if (!user) {
                console.log("Invalid Refresh Token sent!");
                throw new UnauthorizedException("Invalid refresh token");
            }
            const payload = { sub: user.id, email: user.email };
            const newAccessToken = await this.jwtService.signAsync(payload);
            const newRefreshToken = await this.generateRefreshToken(user);

            console.log("new JWT: ", newAccessToken);
            console.log("new Refresh: ", newRefreshToken);
            console.log("Returning new tokens to the user: ", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: user.convertToPrivateDTO(),
            };
        } catch (e) {
            console.log("User refreshment failed! ", e);
        }
    }
}
