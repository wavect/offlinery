import { User } from "@/entities/user/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [MapService],
    controllers: [MapController],
    exports: [MapService],
})
export class MapModule {}
