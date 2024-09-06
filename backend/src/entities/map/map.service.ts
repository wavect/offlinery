import { User } from "@/entities/user/user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Point } from "geojson";
import { Repository } from "typeorm";

@Injectable()
export class MapService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async getLocationPoints(userId: string): Promise<Point[]> {
        const currentUser = await this.userRepository.findOne({
            where: { id: userId },
            select: ["id", "location"],
        });

        if (!currentUser || !currentUser.location) {
            throw new Error("Current user location not found");
        }

        // TODO this can get quite expensive as we also need to consider the users "blacklist" position
        // TODO as well as the blacklisted position of each user
        // TODO preferably we calculate blacklisted position objects before and store them ready-to-convert
        const query = this.userRepository
            .createQueryBuilder("user")
            .select("user.location")
            .where("user.id != :userId", { userId })
            .where("user.dateMode != 'ghost'")
            .andWhere("user.isActive = :isActive", { isActive: true });

        const results = await query.getRawMany();

        return results.map((result) => result.user_location as Point);
    }
}
