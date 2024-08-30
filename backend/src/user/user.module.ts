import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendingUser } from "src/registration/pending-user/pending-user.entity";
import { BlacklistedRegion } from "../blacklisted-region/blacklisted-region.entity";
import { Encounter } from "../encounter/encounter.entity";
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
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
