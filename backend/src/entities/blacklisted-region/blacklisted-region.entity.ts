import { BaseEntity } from "@/entities/base.entity";
import { User } from "@/entities/user/user.entity";
import { Point } from "geojson";
import { Column, Entity, Index, ManyToOne } from "typeorm";

@Entity()
export class BlacklistedRegion extends BaseEntity {
    @Index({ spatial: true })
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
    })
    location: Point;

    @Column("float")
    radius: number;

    @ManyToOne(() => User, (user) => user.blacklistedRegions, {
        onDelete: "CASCADE",
    })
    user: User;
}
