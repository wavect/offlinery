import { ApiUserService } from "@/entities/api-user/api-user.service";
import { TYPED_ENV } from "@/utils/env.utils";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DefaultApiUserSeeder {
    private readonly logger = new Logger(DefaultApiUserSeeder.name);

    constructor(private apiUserService: ApiUserService) {}

    async seedApiUsers(): Promise<void> {
        if (
            await this.apiUserService.findApiUserByEmail(
                TYPED_ENV.EMAIL_USERNAME,
            )
        ) {
            this.logger.debug(
                `Default api user already seeded: ${TYPED_ENV.EMAIL_USERNAME}`,
            );
        } else {
            await this.apiUserService.createApiUser(
                TYPED_ENV.EMAIL_USERNAME,
                true,
                true,
            );
            this.logger.debug(
                `Seeded admin api user for ${TYPED_ENV.EMAIL_USERNAME}`,
            );
        }
    }
}
