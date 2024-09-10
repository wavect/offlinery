import { Injectable } from "@nestjs/common";
import { Point } from "geojson";

interface ClusteredPoint {
    latitude: number;
    longitude: number;
    weight: number;
}

@Injectable()
export class ClusteringService {
    /** @DEV - cluster users within 1,5 km */
    private readonly CLUSTER_RADIUS = 1500;
    /** @DEV - min weight + radius makes it impossible to spot single users */
    private readonly MIN_WEIGHT = 10;
    /** @DEV - how far user positions are shiftes */
    private readonly MAX_SHIFT = 0.0005;
    /** @DEV - base radius of a single point in FE - todo move to FE */
    private readonly HEAT_MAP_BASE_RADIUS = 350;

    getClusteredPoints(points: Point[]): ClusteredPoint[] {
        const clusters: ClusteredPoint[] = [];

        for (const point of points) {
            const [longitude, latitude] = point.coordinates;
            let foundCluster = false;

            for (const cluster of clusters) {
                if (
                    this.calculateDistance(
                        latitude,
                        longitude,
                        cluster.latitude,
                        cluster.longitude,
                    ) <= this.CLUSTER_RADIUS
                ) {
                    cluster.weight += 25;
                    foundCluster = true;
                    break;
                }
            }

            if (!foundCluster) {
                clusters.push({
                    latitude,
                    longitude,
                    weight: this.MIN_WEIGHT, // Start with minimum weight for privacy
                });
            }
        }

        /** @DEV with the new cluster setting, this is kind-of deprecated, keeping here
         *       as an argument that "user positions never reach devices"
         */
        return clusters.map((cluster) => ({
            latitude: cluster.latitude + (Math.random() - 0.5) * this.MAX_SHIFT,
            longitude:
                cluster.longitude + (Math.random() - 0.5) * this.MAX_SHIFT,
            weight: Math.max(this.MIN_WEIGHT, Math.min(cluster.weight, 100)), // Cap weight between MIN_WEIGHT and 10
        }));
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371e3; // Earth's radius in meters
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) *
                Math.cos(phi2) *
                Math.sin(deltaLambda / 2) *
                Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}

export { ClusteredPoint };
