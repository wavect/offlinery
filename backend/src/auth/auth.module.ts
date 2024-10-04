import { ApiUser } from "@/entities/api-user/api-user.entity";
import { ApiUserModule } from "@/entities/api-user/api-user.module";
import { ApiUserService } from "@/entities/api-user/api-user.service";
import { UserModule } from "@/entities/user/user.module";
import { TYPED_ENV } from "@/utils/env.utils";
import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserSpecificAuthGuard } from "./auth-own-data.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService, ApiUserService, UserSpecificAuthGuard],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        forwardRef(() => UserModule),
        JwtModule.register({
            global: true,
            secret: TYPED_ENV.JWT_SECRET,
            signOptions: { expiresIn: "1m" },
        }),
        TypeOrmModule.forFeature([ApiUser]),
        ApiUserModule,
    ],
    exports: [UserSpecificAuthGuard, AuthService],
})
export class AuthModule {}
