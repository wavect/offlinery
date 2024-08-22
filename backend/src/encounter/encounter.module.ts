import { Module } from '@nestjs/common';
import { EncounterController } from './encounter.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/user.entity";
import {BlacklistedRegion} from "../blacklisted-region/blacklisted-region.entity";
import {UserReport} from "../user-report/user-report.entity";
import {UserService} from "../user/user.service";
import {UserController} from "../user/user.controller";
import {Encounter} from "./encounter.entity";
import {EncounterService} from "./encounter.service";

@Module({
  imports: [TypeOrmModule.forFeature([Encounter, User])],
  providers: [EncounterService],
  controllers: [EncounterController],
  exports: [EncounterService],
})
export class EncounterModule {}