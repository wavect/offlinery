import { AuthModule } from "@/auth/auth.module";
import { AppStatistic } from "@/entities/app-stats/app-stat.entity";
import { AppStatsModule } from "@/entities/app-stats/app-stats.module";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { Message } from "@/entities/messages/message.entity";
import { MessageModule } from "@/entities/messages/message.module";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { NotificationModule } from "@/transient-services/notification/notification.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            BlacklistedRegion,
            UserReport,
            Encounter,
            PendingUser,
            AuthModule,
            AppStatistic,
            Message,
        ]),
        forwardRef(() => NotificationModule),
        forwardRef(() => MatchingModule),
        forwardRef(() => AuthModule),
        forwardRef(() => EncounterModule),
        MessageModule,
        AppStatsModule,
    ],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserService, UserRepository, TypeOrmModule],
})
export class UserModule {}
