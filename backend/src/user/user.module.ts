import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import {User} from "./user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller";
import {BlacklistedRegion} from "../blacklisted-region/blacklisted-region.entity";
import {UserReport} from "../user-report/user-report.entity";
import {Encounter} from "../encounter/encounter.entity";
import { PendingUser } from 'src/registration/pending-user/pending-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlacklistedRegion, UserReport, Encounter, PendingUser])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
