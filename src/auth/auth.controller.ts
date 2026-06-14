import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto, LoginDto, RegisterDto } from "./dto";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller('auth')
export class AuthController {
    private readonly isProduction: boolean;

    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    @Post('register')
    async register(
        @Body() data: RegisterDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const { accessToken, refreshToken } = await this.authService.register(data);

        this.setRefreshTokenCookie(response, refreshToken);
        return { accessToken };
    }

    @Post('login')
    async login(
        @Body() data: LoginDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const { accessToken, refreshToken } = await this.authService.login(data);

        this.setRefreshTokenCookie(response, refreshToken);
        return { accessToken };
    }

    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<void> {
        const refreshToken = request.cookies['refresh_token'];
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        this.clearRefreshTokenCookie(response);
    }

    @Post('refresh')
    async refreshTokens(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const refreshToken = request.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is not in cookies');
        }

        const tokens = await this.authService.refreshTokens(refreshToken);

        this.setRefreshTokenCookie(response, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }

    // приватные хелперы
    private setRefreshTokenCookie(response: Response, refreshToken: string): void {
        response.cookie('refresh_token', refreshToken, {
            path: '/auth/refresh', // указываем бразеру эндпоинт куда в будущем слать куки
            httpOnly: true,
            secure: this.isProduction, // настройка для отправки только по HTTPS пока что выключил
            sameSite: 'strict', // защита от CSRF
            maxAge: 1000 * 60 * 60 * 24 * 30, // срок жизни куки
        });
    }

    private clearRefreshTokenCookie(response: Response): void {
        response.clearCookie('refresh_token', {
            path: '/auth/refresh',
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'strict',
        })
    }
}