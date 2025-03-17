import { USER_ID_PARAM, USER_OBJ_ID } from "@/auth/auth.guard";
import { extractTokenFromHeader } from "@/auth/auth.utils";
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

export const REQUIRE_OWN_PENDING_USER = "requireOwnPendingUser";
export const OnlyValidRegistrationSession = () =>
    SetMetadata(REQUIRE_OWN_PENDING_USER, true);

@Injectable()
export class UserSpecificRegistrationGuard implements CanActivate {
    private readonly logger = new Logger(UserSpecificRegistrationGuard.name);

    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requireOwnUser = this.reflector.getAllAndOverride<boolean>(
            REQUIRE_OWN_PENDING_USER,
            [context.getHandler(), context.getClass()],
        );

        if (!requireOwnUser) {
            return true; // The route doesn't require user-specific check
        }

        const request = context.switchToHttp().getRequest();

        const token = extractTokenFromHeader(request);
        if (!token) {
            this.logger.debug(
                `Unauthorized call attempt to protected route with no registration jwt`,
            );
            throw new UnauthorizedException();
        }
        try {
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request[USER_OBJ_ID] = await this.jwtService.verifyAsync(token, {
                secret: TYPED_ENV.JWT_SECRET_REGISTRATION,
            });
        } catch {
            this.logger.debug(
                `Unauthorized call attempt to protected registration route with invalid token: ${token}`,
            );
            throw new UnauthorizedException();
        }

        const user = request[USER_OBJ_ID]; // Assuming the user object is attached by the AuthGuard

        if (!user) {
            this.logger.debug(
                `Call to protected registration route without being authenticated at all!`,
            );
            throw new ForbiddenException("User not authenticated");
        }

        const params = request.params;
        if (params[USER_ID_PARAM] && params[USER_ID_PARAM] !== user.id) {
            this.logger.warn(
                `Someone tried to hijack a registration session that does not belong to them!`,
            );
            throw new ForbiddenException("Access denied");
        }

        return true;
    }
}
