import { ApiUser } from "@/entities/api-user/api-user.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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
