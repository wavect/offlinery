import { OnlyOwnUserData, USER_ID_PARAM } from "@/auth/auth-own-data.guard";
import { WeightedLatLngDTO } from "@/DTOs/map.dto";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Point } from "geojson";
import { MapService } from "./map.service";

@ApiTags("Map")
@Controller({
    version: "1",
    path: "map",
})
export class MapController {
    constructor(private readonly mapService: MapService) {}

    @Get(`:${USER_ID_PARAM}`)
    @OnlyOwnUserData()
    @ApiOperation({ summary: "Get the locations of other users" })
    @ApiParam({ name: USER_ID_PARAM, type: "string", description: "User ID" })
    async getUserLocations(
        @Param(USER_ID_PARAM) userId: string,
    ): Promise<WeightedLatLngDTO[]> {
        const locations = await this.mapService.getLocationPoints(userId);
        return locations.map((location: Point) => ({
            latitude: location.coordinates[1],
            longitude: location.coordinates[0],
            weight: 10,
        }));
    }
}
