import { SignInJwtDTO } from "@/DTOs/sign-in-jwt.dto";
import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { SignInDTO } from "@/DTOs/sign-in.dto";
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "./auth.guard";
import { AuthService } from "./auth.service";

@ApiTags("Auth")
@Controller({
    version: "1",
    path: "auth",
})
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("login")
    signIn(@Body() signInDTO: SignInDTO): Promise<SignInResponseDTO> {
        return this.authService.signIn(
            signInDTO.email,
            signInDTO.clearPassword,
        );
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login/jwt")
    signInByJWT(@Body() signInDTO: SignInJwtDTO): Promise<SignInResponseDTO> {
        return this.authService.signInWithJWT(signInDTO.jwtAccessToken);
    }
}
