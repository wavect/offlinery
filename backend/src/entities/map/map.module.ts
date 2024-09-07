import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";

@Module({
    imports: [TypeOrmModule.forFeature([User]), MatchingModule, UserModule],
    providers: [MapService],
    controllers: [MapController],
    exports: [MapService],
})
export class MapModule {}
