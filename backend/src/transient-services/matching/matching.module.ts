import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { EncounterModule } from "@/entities/encounter/encounter.module";
import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { ClusteringModule } from "@/transient-services/clustering/clustering.module";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationModule } from "../notification/notification.module";
import { MatchingService } from "./matching.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, BlacklistedRegion]),
        forwardRef(() => UserModule),
        forwardRef(() => NotificationModule),
        forwardRef(() => EncounterModule),
        forwardRef(() => ClusteringModule),
    ],
    providers: [MatchingService],
    controllers: [],
    exports: [MatchingService],
})
export class MatchingModule {}
