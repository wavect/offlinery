import { USER_OBJ_ID } from "@/auth/auth.guard";
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    Logger,
    SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

const REQUIRE_OWN_USER = "requireOwnUser";
export const OnlyOwnUserData = () => SetMetadata(REQUIRE_OWN_USER, true);
export const USER_ID_PARAM = "userId";

@Injectable()
export class UserSpecificAuthGuard implements CanActivate {
    private readonly logger = new Logger(UserSpecificAuthGuard.name);

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requireOwnUser = this.reflector.getAllAndOverride<boolean>(
            REQUIRE_OWN_USER,
            [context.getHandler(), context.getClass()],
        );

        if (!requireOwnUser) {
            return true; // The route doesn't require user-specific check
        }

        const request = context.switchToHttp().getRequest();
        const user = request[USER_OBJ_ID]; // Assuming the user object is attached by the AuthGuard

        if (!user) {
            this.logger.debug(
                `Call to protected route without being authenticated at all!`,
            );
            throw new ForbiddenException("User not authenticated");
        }

        const params = request.params;
        if (params[USER_ID_PARAM] && params[USER_ID_PARAM] !== user.id) {
            this.logger.warn(
                `Someone tried to access user data that does not belong to them!`,
            );
            throw new ForbiddenException("Access denied");
        }

        return true;
    }
}
