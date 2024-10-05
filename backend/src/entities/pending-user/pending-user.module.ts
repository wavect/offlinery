import { AuthModule } from "@/auth/auth.module";
import { PendingUser } from "@/entities/pending-user/pending-user.entity";
import { User } from "@/entities/user/user.entity";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PendingUserController } from "./pending-user.controller";
import { PendingUserService } from "./pending-user.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([PendingUser, User]),
        AuthModule,
    ],
    providers: [PendingUserService],
    controllers: [PendingUserController],
    exports: [PendingUserService],
})
export class PendingUserModule {}
