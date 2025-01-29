import { BaseEntity } from "@/entities/base.entity";
import { Logger } from "@nestjs/common";
import { Column, Entity, EventSubscriber } from "typeorm";

@EventSubscriber()
@Entity()
export class AppStatistic extends BaseEntity {
    private readonly logger = new Logger(AppStatistic.name);

    /** @dev key of app statistic to query more easily */
    @Column({ unique: false, nullable: false })
    key: string;

    @Column({ nullable: false })
    value: string;
}
