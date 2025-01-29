import { AppStatistic } from "@/entities/app-stats/app-stat.entity";
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export enum EAPP_STAT_KEY {
    USERS_DELETED_COUNT = "users-deleted-count",
}

@Injectable()
export class AppStatsService {
    private readonly logger = new Logger(AppStatsService.name);

    constructor(
        @InjectRepository(AppStatistic)
        private appStatisticRepository: Repository<AppStatistic>,
    ) {}

    async incrementValue(key: EAPP_STAT_KEY): Promise<AppStatistic> {
        // Get the most recent value
        let currentStat = await this.getMostRecentStat(key);

        if (!currentStat) {
            currentStat = new AppStatistic();
            currentStat.key = key;
            currentStat.value = "0";
        }

        // Parse the current value - ensure it's a number
        const currentValue = Number(currentStat.value);
        if (isNaN(currentValue)) {
            throw new BadRequestException(
                `Value for key ${key} is not a number`,
            );
        }

        // Create new record with incremented value
        const newValue = (currentValue + 1).toString();
        return await this.appStatisticRepository.save({
            key,
            value: newValue,
        });
    }

    // @dev This will create new rows despite the same key (to have versioning/history) -> created in baseEntity keeps track of the timestamp
    async saveValue(key: EAPP_STAT_KEY, value: string): Promise<AppStatistic> {
        return await this.appStatisticRepository.save({ key, value });
    }

    async getHistoryOfStat(key: EAPP_STAT_KEY): Promise<AppStatistic[]> {
        return await this.appStatisticRepository.find({
            where: { key },
            order: {
                created: "DESC",
            },
        });
    }

    async getMostRecentStat(key: EAPP_STAT_KEY): Promise<AppStatistic> {
        const stat = await this.appStatisticRepository.findOne({
            where: { key },
            order: {
                created: "DESC",
            },
        });

        if (!stat) {
            throw new NotFoundException(`No statistic found for key: ${key}`);
        }

        return stat;
    }
}
