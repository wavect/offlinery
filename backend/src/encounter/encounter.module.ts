import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
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
