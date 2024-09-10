import { USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { WeightedLatLngDTO } from "@/DTOs/map.dto";
import { UserService } from "@/entities/user/user.service";
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
        private readonly userService: UserService,
    ) {}

    @Get(`:${USER_ID_PARAM}`)
    @ApiOperation({ summary: "Get the locations of other users" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    async getUserLocations(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<WeightedLatLngDTO[]> {
        const userToBeApproached = await this.userService.findUserById(userId);
        const nearbyMatches = await this.matchingService.findNearbyMatches(
            userToBeApproached,
            false,
        );

        return nearbyMatches.map((match) => ({
            latitude: match.location.coordinates[1],
            longitude: match.location.coordinates[0],
            weight: 10,
        }));
    }
}
