import { Point } from "geojson";
import {
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity()
export class BlacklistedRegion {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ spatial: true })
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
    })
    location: Point;

    @Column("float")
    radius: number;

    @ManyToOne(() => User, (user) => user.blacklistedRegions)
    user: User;
}
