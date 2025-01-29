import { AppStatistic } from "@/entities/app-stats/app-stat.entity";
import { AppStatsService } from "@/entities/app-stats/app-stats.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([AppStatistic])],
    providers: [AppStatsService],
    controllers: [],
    exports: [AppStatsService],
})
export class AppStatsModule {}
