import { AuthModule } from "@/auth/auth.module";
import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { Encounter } from "@/entities/encounter/encounter.entity";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { UserReport } from "@/entities/user-report/user-report.entity";
import { UserRepository } from "@/entities/user/user.repository";
import { MatchingModule } from "@/transient-services/matching/matching.module";
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
        ]),
        forwardRef(() => MatchingModule),
        forwardRef(() => AuthModule),
    ],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserService, UserRepository, TypeOrmModule],
})
export class UserModule {}
