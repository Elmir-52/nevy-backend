import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto, GetAuthParams, LoginDto, RegisterDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {} 

    @Post('register')
    register(@Body() data: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(data);
    }

    @Post('login')
    login(@Body() data: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(data);
    }

    @Post('logout/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Param() { userId }: GetAuthParams): Promise<void> {
        return this.authService.logout(userId);
    }

    @Post('refresh')
    updateTokens(@Headers('Authorization') rawRefreshToken: string): Promise<AuthResponseDto> {
        return this.authService.updateTokens(rawRefreshToken);
    }
}