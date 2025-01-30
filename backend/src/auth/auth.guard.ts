import { REQUIRE_OWN_PENDING_USER } from "@/auth/auth-registration-session";
import { extractTokenFromHeader } from "@/auth/auth.utils";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { UserService } from "@/entities/user/user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger,
    SetMetadata,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export const USER_OBJ_ID = "user";
export const IS_PUBLIC_KEY = "isPublic";
/** @dev Use this above controller methods to declare routes as public since all routes are private by default! */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

const REQUIRE_ONLY_ADMIN = "onlyAdmin";
export const OnlyAdmin = () => SetMetadata(REQUIRE_ONLY_ADMIN, true);
const API_KEY_HEADER_ID = "o-api-key";
const API_KEY_SECRET_TOKEN_HEADER_ID = "o-api-secret-token";

export const USER_ID_PARAM = "userId";
export const REQUIRE_OWN_USER = "requireOwnUser";
export const OnlyOwnUserData = () => SetMetadata(REQUIRE_OWN_USER, true);

export const RESTRICTED_VIEW = "restrictedView";
export const RestrictedView = () => SetMetadata(RESTRICTED_VIEW, true);

/** @dev All routes are private by default */
@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private apiUserService: ApiUserService,
        private userService: UserService,
    ) {}

    /** @dev All routes are forbidden by default except the ones marked as @Public() */
    private isPublicRoute(context: ExecutionContext): boolean {
        // isPublic = true, otherwise false
        return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    private isRestrictedView(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(RESTRICTED_VIEW, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    private isOnlyValidRegistrationSessionRoute(
        context: ExecutionContext,
    ): boolean {
        return this.reflector.getAllAndOverride<boolean>(
            REQUIRE_OWN_PENDING_USER,
            [context.getHandler(), context.getClass()],
        );
    }

    private isOnlyOwnDataGuard(context: ExecutionContext): boolean {
        return this.reflector.getAllAndOverride<boolean>(REQUIRE_OWN_USER, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    /** @dev All routes are forbidden by default except the ones marked as @OnlyAdmin() */
    private isAdminRoute(context: ExecutionContext): boolean {
        // isAdmin = true, otherwise false
        return this.reflector.getAllAndOverride<boolean>(REQUIRE_ONLY_ADMIN, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    /** @dev Some routes, e.g. admin routes, should be callable via admin api keys instead of JWT. */
    private async isAdminApiUser(request: Request): Promise<boolean> {
        const apiKey = request.headers[API_KEY_HEADER_ID];
        const clearSecretToken =
            request.headers[API_KEY_SECRET_TOKEN_HEADER_ID];
        if (!apiKey || !clearSecretToken) {
            return false;
        }
        return await this.apiUserService.isValidAdminApiKey(
            apiKey.toString(),
            clearSecretToken.toString(),
        );
    }

    private async isAuthorizedToAccessRestrictedView(
        request: Request,
    ): Promise<boolean> {
        const userToken = request.query.token;
        const userId = request.query.userId;
        if (!userToken || !userId) {
            this.logger.warn(
                `No userId or userToken provided to access restricted view: ${userId} / ${userToken}`,
            );
            return false;
        }
        return await this.userService.isValidRestrictedViewToken(
            userId.toString(),
            userToken.toString(),
        );
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isPublicRoute(context)) {
            this.logger.debug(`Call to public route, bypassing auth.guard`);
            return true;
        }
        if (this.isOnlyValidRegistrationSessionRoute(context)) {
            // registration session specific route, do not gate-keep through regular auth
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        if (this.isRestrictedView(context)) {
            return await this.isAuthorizedToAccessRestrictedView(request);
        }
        if (this.isAdminRoute(context)) {
            return await this.isAdminApiUser(request);
        }

        const token = extractTokenFromHeader(request);
        if (!token) {
            this.logger.debug(
                `Unauthorized call attempt to protected route ${request.route?.path} with no jwt and no valid api key`,
            );
            throw new UnauthorizedException();
        }
        try {
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers

            request[USER_OBJ_ID] = await this.jwtService.verifyAsync(token, {
                secret: TYPED_ENV.JWT_SECRET,
            });

            if (this.isOnlyOwnDataGuard(context)) {
                const params = request.params;
                const user = request[USER_OBJ_ID];
                if (
                    params[USER_ID_PARAM] &&
                    params[USER_ID_PARAM] !== user.sub
                ) {
                    this.logger.warn(
                        `Someone tried to access user data that does not belong to them: ${user.id} != ${params[USER_ID_PARAM]}`,
                    );
                    throw new ForbiddenException("Access denied");
                }
            }
        } catch {
            this.logger.debug(
                `Unauthorized call attempt to protected route with invalid token: ${token}`,
            );
            throw new UnauthorizedException();
        }
        return true;
    }
}
