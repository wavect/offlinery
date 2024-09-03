import { User } from "@/entities/user/user.entity";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EncounterController } from "./encounter.controller";
import { Encounter } from "./encounter.entity";
import { EncounterService } from "./encounter.service";

@Module({
    imports: [TypeOrmModule.forFeature([Encounter, User])],
    providers: [EncounterService],
    controllers: [EncounterController],
    exports: [EncounterService],
})
export class EncounterModule {}
