import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

const REQUIRE_OWN_USER = "requireOwnUser";
export const OnlyOwnUserData = () => SetMetadata(REQUIRE_OWN_USER, true);
export const USER_ID_PARAM = "userId";

@Injectable()
export class UserSpecificAuthGuard implements CanActivate {
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
        const user = request.user; // Assuming the user object is attached by the AuthGuard

        if (!user) {
            throw new ForbiddenException("User not authenticated");
        }

        const params = request.params;
        if (params[USER_ID_PARAM] && params[USER_ID_PARAM] !== user.id) {
            throw new ForbiddenException("Access denied");
        }

        return true;
    }
}
