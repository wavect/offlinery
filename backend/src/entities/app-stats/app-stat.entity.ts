import { EAPP_STAT_KEY } from "@/entities/app-stats/app-stats.types";
import { BaseEntity } from "@/entities/base.entity";
import { Column, Entity, EventSubscriber } from "typeorm";

@EventSubscriber()
@Entity()
export class AppStatistic extends BaseEntity {
    /** @dev key of app statistic to query more easily */
    @Column({ unique: false, nullable: false, enum: EAPP_STAT_KEY })
    key: EAPP_STAT_KEY;

    @Column({ nullable: false })
    value: string;
}
