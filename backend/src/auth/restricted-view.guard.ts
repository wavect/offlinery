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

export const RESTRICTED_VIEW = "restrictedView";
export const RestrictedView = () => SetMetadata(RESTRICTED_VIEW, true);

@Injectable()
export class RestrictedViewGuard implements CanActivate {
    private readonly logger = new Logger(RestrictedViewGuard.name);

    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.error("HHHHH");

        const restrictedView = this.reflector.getAllAndOverride<boolean>(
            RESTRICTED_VIEW,
            [context.getHandler(), context.getClass()],
        );

        if (!restrictedView) {
            return true; // The route doesn't require user-specific check
        }

        const request = context.switchToHttp().getRequest();

        const token = extractTokenFromHeader(request);
        if (!token) {
            this.logger.debug(
                `Unauthorized call attempt to restricted view route with no token`,
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
                `Unauthorized call attempt to restricted view route with invalid token: ${token}`,
            );
            throw new UnauthorizedException();
        }

        const user = request[USER_OBJ_ID]; // Assuming the user object is attached by the AuthGuard

        if (!user) {
            this.logger.debug(
                `Call to restricted view route without being authenticated at all!`,
            );
            throw new ForbiddenException("User not authenticated");
        }

        const params = request.params;
        if (params[USER_ID_PARAM] && params[USER_ID_PARAM] !== user.id) {
            this.logger.warn(
                `Someone tried to hijack a restricted view session that does not belong to them!`,
            );
            throw new ForbiddenException("Access denied");
        }

        return true;
    }
}
