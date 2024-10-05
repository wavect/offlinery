import { User } from "@/entities/user/user.entity";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { EDateMode } from "@/types/user.types";
import { getIntegrationTestModule } from "../../_src/modules/integration-test.module";

describe("MatchingService Integration", () => {
    let matchingService: MatchingService;

    beforeEach(async () => {
        const { module } = await getIntegrationTestModule();

        matchingService = module.get<MatchingService>(MatchingService);
    });

    describe("findNearbyMatches: execution path is correct, depending on the enableExtendedChecks flag", () => {
        it("should return an empty array when user is not sharing location", async () => {
            const user = new User();
            user.dateMode = EDateMode.GHOST;
            const result =
                await matchingService.findPotentialMatchesForHeatmap(user);
            expect(result).toEqual([]);
        });
    });
});
