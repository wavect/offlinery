import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlacklistedRegionController } from "./blacklisted-region.controller";
import { BlacklistedRegion } from "./blacklisted-region.entity";
import { BlacklistedRegionService } from "./blacklisted-region.service";

@Module({
    imports: [TypeOrmModule.forFeature([BlacklistedRegion])],
    providers: [BlacklistedRegionService],
    controllers: [BlacklistedRegionController],
})
export class BlacklistedRegionModule {}
