import { ApiUser } from "@/entities/api-user/api-user.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";

@Injectable()
export class ApiUserService {
    private readonly logger = new Logger(ApiUserService.name);

    constructor(
        @InjectRepository(ApiUser)
        private apiUserRepository: Repository<ApiUser>,
    ) {}

    async findApiUserByApiKey(apiKey: string): Promise<ApiUser | undefined> {
        return await this.apiUserRepository.findOneBy({
            apiKey,
        });
    }

    async isValidAdminApiKey(
        apiKey: string,
        clearSecretToken: string,
    ): Promise<boolean> {
        const apiUser = await this.findApiUserByApiKey(apiKey);

        if (!apiUser) {
            return false;
        }
        const isSecretTokenValid = await bcrypt.compare(
            clearSecretToken,
            apiUser.apiSecretTokenHash,
        );
        this.logger.debug(
            `Valid API key and secret token provided for apiKey: ${apiKey}`,
        );
        return isSecretTokenValid && apiUser.isActive && apiUser.isAdmin;
    }

    async findApiUserByEmail(email: string): Promise<ApiUser | undefined> {
        return await this.apiUserRepository.findOne({
            where: { email },
        });
    }

    async createApiUser(email: string, isAdmin = false, isActive = true) {
        const newApiUser = this.apiUserRepository.create({
            email,
            isAdmin,
            isActive,
        });
        await this.apiUserRepository.save(newApiUser);
    }
}
