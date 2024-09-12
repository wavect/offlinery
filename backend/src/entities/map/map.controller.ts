import { USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { WeightedLatLngDTO } from "@/DTOs/map.dto";
import { UserService } from "@/entities/user/user.service";
import { ClusteringService } from "@/transient-services/clustering/cluster.service";
import { MatchingService } from "@/transient-services/matching/matching.service";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

@ApiTags("Map")
@Controller({
    version: "1",
    path: "map",
})
export class MapController {
    constructor(
        private readonly matchingService: MatchingService,
        private readonly clusterService: ClusteringService,
        private readonly userService: UserService,
    ) {}

    @Get(`:${USER_ID_PARAM}`)
    @ApiOperation({ summary: "Get the clustered locations of other users" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    async getUserLocations(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<WeightedLatLngDTO[]> {
        const userToBeApproached = await this.userService.findUserById(userId);
        const userLocations = await this.matchingService.findNearbyMatches(
            userToBeApproached,
            false,
        );
        return this.clusterService.getClusteredPoints(
            userLocations.map((b) => b.location),
        );
    }
}
