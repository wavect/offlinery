import { BlacklistedRegion } from "@/blacklisted-region/blacklisted-region.entity";
import { EncounterModule } from "@/encounter/encounter.module";
import { User } from "@/user/user.entity";
import { UserModule } from "@/user/user.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "../notification/notification.module";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, BlacklistedRegion]),
        forwardRef(() => UserModule),
        forwardRef(() => NotificationModule),
        EncounterModule,
    ],
    providers: [MatchingService],
    controllers: [MatchingController],
    exports: [MatchingService],
})
export class MatchingModule {}
