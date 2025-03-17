import { EncounterModule } from "@/entities/encounter/encounter.module";
import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { forwardRef, Module } from "@nestjs/common";

@Module({
    imports: [forwardRef(() => EncounterModule)],
    providers: [ClusteringService],
    controllers: [],
    exports: [ClusteringService],
})
export class ClusteringModule {}
