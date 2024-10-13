import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Point } from "geojson";
import { PointBuilder } from "../../_src/builders/pointer.builder";

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
                new PointBuilder().build(0, 0),
                new PointBuilder().build(0.001, 0.001),
                new PointBuilder().build(1, 1),
            ];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(2);
            expect(result.find((p) => p.weight > 5)).toBeDefined(); // Cluster with 2 points
        });

        it("should apply minimum weight to single points", () => {
            const points: Point[] = [
                new PointBuilder().build(0, 0),
                new PointBuilder().build(2, 2),
            ];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(2);
            expect(result.every((p) => p.weight >= 10)).toBe(true);
        });

        it("should apply random shift to points", () => {
            const points: Point[] = [new PointBuilder().build(0, 0)];

            const result = service.getClusteredPoints(points);

            expect(result.length).toBe(1);
            expect(result[0].latitude).not.toBe(0);
            expect(result[0].longitude).not.toBe(0);
            expect(Math.abs(result[0].latitude)).toBeLessThan(0.0005);
            expect(Math.abs(result[0].longitude)).toBeLessThan(0.0005);
        });
    });
});
