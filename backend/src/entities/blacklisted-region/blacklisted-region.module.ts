import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlacklistedRegion } from "./blacklisted-region.entity";

@Module({
    imports: [TypeOrmModule.forFeature([BlacklistedRegion])],
    providers: [],
    controllers: [],
})
export class BlacklistedRegionModule {}
