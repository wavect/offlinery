import { ApiUserService } from "@/entities/api-user/api-user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    SetMetadata,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export const IS_PUBLIC_KEY = "isPublic";
/** @dev Use this above controller methods to declare routes as public since all routes are private by default! */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

const REQUIRE_ONLY_ADMIN = "onlyAdmin";
export const OnlyAdmin = () => SetMetadata(REQUIRE_ONLY_ADMIN, true);
export const API_KEY_HEADER_ID = "o-api-key";

/** @dev All routes are private by default */
@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private apiUserService: ApiUserService,
    ) {}

    /** @dev All routes are forbidden by default except the ones marked as @Public() */
    private isPublicRoute(context: ExecutionContext): boolean {
        // isPublic = true, otherwise false
        return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
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
        const apiKey = request.headers[API_KEY_HEADER_ID]; // give the name you want
        if (!apiKey) {
            return false;
        }
        const apiUser = await this.apiUserService.findApiUserByApiKey(
            apiKey.toString(),
        );
        return apiUser && apiUser.isActive && apiUser.isAdmin;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isPublicRoute(context)) {
            this.logger.debug(`Call to public route, bypassing auth.guard`);
            return true;
        }

        const request = context.switchToHttp().getRequest();
        if (this.isAdminRoute(context)) {
            return await this.isAdminApiUser(request);
        }

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logger.debug(
                `Unauthorized call attempt to protected route with no jwt and no valid api key`,
            );
            throw new UnauthorizedException();
        }
        try {
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request["user"] = await this.jwtService.verifyAsync(token, {
                secret: TYPED_ENV.JWT_SECRET,
            });
        } catch {
            this.logger.debug(
                `Unauthorized call attempt to protected route with invalid token: ${token}`,
            );
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
