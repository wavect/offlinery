import {Body, Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {SignInDTO} from "../DTOs/sign-in.dto";
import {SignInResponseDTO} from "../DTOs/sign-in-response.dto";
import {Public} from './auth.guard';
import {ApiTags} from "@nestjs/swagger";

@ApiTags('Auth')
@Controller({
        version: '1',
        path: 'auth',
    }
)
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDTO: SignInDTO): Promise<SignInResponseDTO> {
        return this.authService.signIn(signInDTO.email, signInDTO.clearPassword);
    }
}
