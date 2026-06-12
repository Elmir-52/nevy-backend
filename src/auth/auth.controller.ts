import { Body, Controller, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { LogingDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {} 

    @Post('register')
    register(@Body() data: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(data);
    }

    @Post('login')
    login(@Body() data: LogingDto): Promise<AuthResponseDto> {
        return this.authService.login(data);
    }

    @Post('update-tokens')
    updateTokens(@Headers('Authorization') rawRefreshToken: string): Promise<AuthResponseDto> {
        return this.authService.updateTokens(rawRefreshToken);
    }
}