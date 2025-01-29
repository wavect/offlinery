import { getTypedCoordinatesFromPoint } from "@/utils/location.utils";
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
    private readonly MIN_WEIGHT_SINGLE_USER = 10;
    /** @DEV - min weight + radius makes it impossible to spot single users */
    private readonly CLUSTER_ADDITION_PER_USER = 15;
    /** @DEV - how far user positions shifts 0.0009 = 100 metres */
    private readonly MAX_SHIFT = 0.0009;

    getClusteredPoints(points: Point[]): ClusteredPoint[] {
        const clusters: ClusteredPoint[] = [];

        for (const point of points) {
            const { longitude, latitude } = getTypedCoordinatesFromPoint(point);
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
                    cluster.weight += this.CLUSTER_ADDITION_PER_USER;
                    foundCluster = true;
                    break;
                }
            }

            if (!foundCluster) {
                clusters.push({
                    latitude,
                    longitude,
                    weight: this.MIN_WEIGHT_SINGLE_USER, // Start with minimum weight for privacy
                });
            }
        }

        /** @DEV - shift the user positions, so real positions never leave the server */
        return clusters.map((cluster) => ({
            latitude: cluster.latitude + (Math.random() - 0.5) * this.MAX_SHIFT,
            longitude:
                cluster.longitude + (Math.random() - 0.5) * this.MAX_SHIFT,
            weight: Math.max(
                this.MIN_WEIGHT_SINGLE_USER,
                Math.min(cluster.weight, 100),
            ),
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
