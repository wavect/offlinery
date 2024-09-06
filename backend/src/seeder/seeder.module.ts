import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { RegistrationModule } from "@/entities/registration/registration.module";
import { RegistrationService } from "@/entities/registration/registration.service";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { User } from "@/entities/user/user.entity";
import { UserService } from "@/entities/user/user.service";
import { DefaultUserSeeder } from "@/seeder/default-user.seeder";
import { RandomUserLocationsSeeder } from "@/seeder/randomUserLocations.seeder";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            BlacklistedRegion,
            UserReport,
            Encounter,
            PendingUser,
        ]),
        RegistrationModule,
        forwardRef(() => MatchingModule),
    ],
    providers: [
        DefaultUserSeeder,
        RegistrationService,
        UserService,
        RandomUserLocationsSeeder,
    ],
    exports: [DefaultUserSeeder, RandomUserLocationsSeeder],
})
export class SeederModule {}
