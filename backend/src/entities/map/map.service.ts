import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { Injectable } from "@nestjs/common";
import { Point } from "geojson";

@Injectable()
export class MapService {
    constructor(private readonly clusterService: ClusteringService) {}

    public async getClusteredPoints(points: Point[]) {
        return this.clusterService.getClusteredPoints(points);
    }
}
