import { EncounterModule } from "@/entities/encounter/encounter.module";
import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([]), EncounterModule],
    providers: [ClusteringService],
    controllers: [],
    exports: [ClusteringService],
})
export class ClusteringModule {}
