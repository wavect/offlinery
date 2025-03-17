import { BlacklistedRegion } from "@/entities/blacklisted-region/blacklisted-region.entity";
import { User } from "@/entities/user/user.entity";
import { Point } from "geojson";
import { AbstractEntityBuilder } from "./_abstract-entity-builder";

export class BlacklistedRegionBuilder extends AbstractEntityBuilder<BlacklistedRegion> {
    protected createInitialEntity(): BlacklistedRegion {
        const blacklistedRegion = new BlacklistedRegion();
        blacklistedRegion.location = {
            type: "Point",
            coordinates: [0, 0],
        };
        blacklistedRegion.radius = 100;
        return blacklistedRegion;
    }

    withId(id: string): this {
        this.entity.id = id;
        return this;
    }

    withLocation(location: Point): this {
        this.entity.location = location;
        return this;
    }

    withRadius(radius: number): this {
        this.entity.radius = radius;
        return this;
    }

    withUser(user: User): this {
        this.entity.user = user;
        return this;
    }
}
