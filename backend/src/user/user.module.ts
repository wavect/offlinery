import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import {User} from "./user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller";
import {BlacklistedRegion} from "../blacklisted-region/blacklisted-region.entity";
import {UserReport} from "../user-report/user-report.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, BlacklistedRegion, UserReport])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
