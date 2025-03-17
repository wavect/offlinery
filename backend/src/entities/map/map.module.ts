import { User } from "@/entities/user/user.entity";
import { UserModule } from "@/entities/user/user.module";
import { ClusteringModule } from "@/transient-services/clustering/clustering.module";
import { MatchingModule } from "@/transient-services/matching/matching.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MapController } from "./map.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        MatchingModule,
        UserModule,
        ClusteringModule,
    ],
    providers: [],
    controllers: [MapController],
    exports: [],
})
export class MapModule {}
