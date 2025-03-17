import { ApiUser } from "@/entities/api-user/api-user.entity";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([ApiUser])],
    providers: [ApiUserService],
    controllers: [],
    exports: [ApiUserService],
})
export class ApiUserModule {}
