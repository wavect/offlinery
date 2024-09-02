import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/encounter/encounter.entity";
import { PendingUser } from "@/registration/pending-user/pending-user.entity";
import { RegistrationModule } from "@/registration/registration.module";
import { RegistrationService } from "@/registration/registration.service";
import { UserSeeder } from "@/seeder/user.seeder";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { UserReport } from "@/user-report/user-report.entity";
import { User } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
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
    providers: [UserSeeder, RegistrationService, UserService],
    exports: [UserSeeder],
})
export class SeederModule {}
