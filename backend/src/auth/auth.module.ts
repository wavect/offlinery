import {Module} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {UserModule} from "../user/user.module";
import {JwtModule} from "@nestjs/jwt";
import {TYPED_ENV} from "../utils/env.utils";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: TYPED_ENV.JWT_SECRET,
            signOptions: {expiresIn: '60s'},
        }),
    ]
})
export class AuthModule {
}
