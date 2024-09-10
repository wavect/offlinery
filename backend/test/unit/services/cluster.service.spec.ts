import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Point } from "geojson";

describe("ClusterService", () => {
    let service: ClusteringService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ClusteringService],
        }).compile();

        service = module.get<ClusteringService>(ClusteringService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getClusteredPoints", () => {
        it("should cluster nearby points", () => {
            const points: Point[] = [
                { type: "Point", coordinates: [0, 0] },
                { type: "Point", coordinates: [0.001, 0.001] }, // ~157m away from [0, 0] hence gets clustered together
                { type: "Point", coordinates: [1, 1] },
            ];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(2);
            expect(result.find((p) => p.weight > 5)).toBeDefined(); // Cluster with 2 points
            expect(result.find((p) => p.weight === 5)).toBeDefined(); // Single point
        });

        it("should apply minimum weight to single points", () => {
            const points: Point[] = [
                { type: "Point", coordinates: [0, 0] },
                { type: "Point", coordinates: [2, 2] },
            ];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(2);
            expect(result.every((p) => p.weight === 5)).toBe(true);
        });

        it("should apply random shift to points", () => {
            const points: Point[] = [{ type: "Point", coordinates: [0, 0] }];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(1);
            expect(result[0].latitude).not.toBe(0);
            expect(result[0].longitude).not.toBe(0);
            expect(Math.abs(result[0].latitude)).toBeLessThan(0.0005);
            expect(Math.abs(result[0].longitude)).toBeLessThan(0.0005);
        });
    });

    describe("calculateDistance", () => {
        it("should calculate distance correctly", () => {
            const testCases = [
                { point1: [0, 0], point2: [0, 0], expectedDistance: 0 },
                { point1: [0, 0], point2: [0, 1], expectedDistance: 111195 }, // ~111.195 km
                { point1: [0, 0], point2: [1, 1], expectedDistance: 157249 }, // ~157.249 km
            ];

            testCases.forEach(({ point1, point2, expectedDistance }) => {
                const distance = (service as any).calculateDistance(
                    point1[0],
                    point1[1],
                    point2[0],
                    point2[1],
                );
                expect(Math.round(distance)).toBe(expectedDistance);
            });
        });
    });
});
