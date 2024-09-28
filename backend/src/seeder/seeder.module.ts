import { AuthModule } from "@/auth/auth.module";
import { AuthService } from "@/auth/auth.service";
import { ApiUser } from "@/entities/api-user/api-user.entity";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { PendingUserModule } from "@/entities/pending-user/pending-user.module";
import { PendingUserService } from "@/entities/pending-user/pending-user.service";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { DefaultApiUserSeeder } from "@/seeder/default-admin-api-user.seeder";
import { DefaultUserSeeder } from "@/seeder/default-user.seeder";
import { RandomUsersSeeder } from "@/seeder/random-users-seeder.service";
import { SpecificUsersEncountersSeeder } from "@/seeder/specific-encounter-seeder.service";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            ApiUser,
            BlacklistedRegion,
            UserReport,
            Encounter,
            PendingUser,
        ]),
        PendingUserModule,
        forwardRef(() => MatchingModule),
        forwardRef(() => AuthModule),
    ],
    providers: [
        DefaultUserSeeder,
        DefaultApiUserSeeder,
        PendingUserService,
        UserService,
        AuthService,
        ApiUserService,
        RandomUsersSeeder,
        SpecificUsersEncountersSeeder,
    ],
    exports: [DefaultUserSeeder, DefaultApiUserSeeder, RandomUsersSeeder],
})
export class SeederModule {}
