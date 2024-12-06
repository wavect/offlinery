import { JwtStatus, SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import {
    REFRESH_TOKEN_EXPIRATION_TIME,
    REGISTRATION_TOKEN_TIME,
    TOKEN_EXPIRATION_TIME,
} from "@/utils/misc.utils";
import {
    forwardRef,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @Inject(forwardRef(() => UserService))
        private usersService: UserService,
        private jwtService: JwtService,
    ) {}

    async signInWithJWT(accessToken: string): Promise<SignInResponseDTO> {
        try {
            await this.jwtService.verifyAsync(accessToken, {
                secret: TYPED_ENV.JWT_SECRET,
            });

            const decoded = this.jwtService.decode(accessToken);
            if (!decoded) {
                return {
                    status: JwtStatus.JWT_DECODE_ERROR,
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                };
            }
            const user: User = await this.usersService.findUserByEmailOrFail(
                decoded.email,
            );

            if (!user) {
                this.logger.debug(
                    `Sign in with JWT failed as user does not exist: ${decoded.email} (extracted from JWT: ${accessToken})`,
                );
                throw new UnauthorizedException();
            }

            const refreshToken = user.refreshToken;
            if (!refreshToken) {
                this.logger.debug(
                    "User migration: Has a valid JWT but no refresh. Needs new login",
                );
                return null;
            }

            return {
                status: JwtStatus.VALID,
                accessToken,
                refreshToken,
                user: user.convertToPrivateDTO(),
            };
        } catch (error) {
            return {
                status: JwtStatus.JWT_INVALID,
                accessToken: null,
                refreshToken: null,
                user: null,
            };
        }
    }

    /** @dev Used to protect routes after the email verification and before user registration
     * to prevent people from hijacking user accounts. */
    async createRegistrationSession(pendingUserId: string) {
        return await this.jwtService.signAsync(
            { pendingUserId },
            {
                secret: TYPED_ENV.JWT_SECRET_REGISTRATION,
                expiresIn: REGISTRATION_TOKEN_TIME,
            },
        );
    }

    async signIn(
        email: string,
        clearPassword: string,
    ): Promise<SignInResponseDTO> {
        const user = await this.usersService.findUserByEmailOrFail(email);
        if (!user) {
            this.logger.debug(
                `Sign in via email failed as email does not exist in DB: ${email}`,
            );
            throw new UnauthorizedException();
        }
        const isPasswordValid = await bcrypt.compare(
            clearPassword,
            user.passwordHash,
        );
        if (!isPasswordValid) {
            this.logger.debug(
                `Sign in attempt with password failed as invalid for userId: ${user.id}`,
            );
            throw new UnauthorizedException();
        }
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: TYPED_ENV.JWT_SECRET,
            expiresIn: TOKEN_EXPIRATION_TIME,
        });
        const refreshToken = await this.generateRefreshToken(user);

        return {
            status: JwtStatus.VALID,
            accessToken,
            refreshToken,
            user: user.convertToPrivateDTO(),
        };
    }

    private async generateRefreshToken(user: User): Promise<string> {
        const refreshToken = uuidv4();
        const expirationDate = new Date();
        expirationDate.setDate(
            expirationDate.getDate() + REFRESH_TOKEN_EXPIRATION_TIME,
        );

        await this.usersService.storeRefreshToken(
            user.id,
            refreshToken,
            expirationDate,
        );
        return refreshToken;
    }

    async refreshAccessToken(refreshToken: string): Promise<SignInResponseDTO> {
        try {
            const user =
                await this.usersService.findUserByRefreshToken(refreshToken);
            this.logger.debug("Refreshing user jwt token", !!user);
            if (!user) {
                this.logger.debug(`Cannot refresh token. User not found.`);
                return {
                    status: JwtStatus.JWT_CREATE_ERROR,
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                };
            }
            const payload = { sub: user.id, email: user.email };
            const newAccessToken = await this.jwtService.signAsync(payload);
            const newRefreshToken = await this.generateRefreshToken(user);

            this.logger.debug(`✓ JWT REFRESH DONE`);

            return {
                status: JwtStatus.VALID,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: user.convertToPrivateDTO(),
            };
        } catch (e) {
            this.logger.debug("User refreshment failed (jwt refresh) ", e);
            return {
                status: JwtStatus.JWT_CREATE_ERROR,
                accessToken: null,
                refreshToken: null,
                user: null,
            };
        }
    }
}
