import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { TYPED_ENV } from "../utils/env.utils";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        JwtModule.register({
            global: true,
            secret: TYPED_ENV.JWT_SECRET,
            signOptions: { expiresIn: "60s" },
        }),
    ],
})
export class AuthModule {}
