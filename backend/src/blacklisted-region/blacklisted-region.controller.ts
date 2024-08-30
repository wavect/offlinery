import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlacklistedRegion } from "./blacklisted-region.entity";

@ApiTags("BlacklistedRegion")
@Controller({
    version: "1",
    path: "blacklisted-region",
})
export class BlacklistedRegionController {
    constructor(
        @InjectRepository(BlacklistedRegion)
        private blacklistedRegionRepository: Repository<BlacklistedRegion>,
    ) {}
}
