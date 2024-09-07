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

/** @dev All routes are private by default */
@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    /** @dev All routes are forbidden by default except the ones marked as @Public() */
    private isPublicRoute(context: ExecutionContext): boolean {
        // isPublic = true, otherwise false
        return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.isPublicRoute(context)) {
            this.logger.debug(`Call to public route, bypassing auth.guard`);
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            this.logger.debug(
                `Unauthorized call attempt to protected route with no token`,
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
