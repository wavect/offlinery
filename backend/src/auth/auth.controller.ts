import { RefreshJwtDTO, SignInJwtDTO } from "@/DTOs/sign-in-jwt.dto";
import { SignInResponseDTO } from "@/DTOs/sign-in-response.dto";
import { SignInDTO } from "@/DTOs/sign-in.dto";
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
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
    private readonly logger = new Logger(AuthController.name);

    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("login")
    signIn(@Body() signInDTO: SignInDTO): Promise<SignInResponseDTO> {
        this.logger.debug(`Trying to sign in user ${signInDTO.email}`);
        return this.authService.signIn(
            signInDTO.email,
            signInDTO.clearPassword,
        );
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login/jwt")
    signInByJWT(@Body() signInDTO: SignInJwtDTO): Promise<SignInResponseDTO> {
        this.logger.debug(
            `Trying to sign in user by JWT ${signInDTO.jwtAccessToken}`,
        );
        return this.authService.signInWithJWT(signInDTO.jwtAccessToken);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("token/refresh")
    refreshJwtToken(
        @Body() signInDTO: RefreshJwtDTO,
    ): Promise<SignInResponseDTO> {
        this.logger.debug(`Refresh Request: ${signInDTO.refreshToken}`);
        return this.authService.refreshAccessToken(signInDTO.refreshToken);
    }
}
