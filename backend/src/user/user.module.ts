import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendingUser } from "src/registration/pending-user/pending-user.entity";
import { BlacklistedRegion } from "../blacklisted-region/blacklisted-region.entity";
import { Encounter } from "../encounter/encounter.entity";
import { MatchingModule } from "../transient-services/matching/matching.module";
import { UserReport } from "../user-report/user-report.entity";
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
        ]),
        forwardRef(() => MatchingModule),
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
