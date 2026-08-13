import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, AuthResponseDto, LoginDto, RegisterDto } from "./dto";
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
    ): Promise<void> {
        const { accessToken, refreshToken } = await this.authService.register(data);

        this.setAccessTokenCookie(response, accessToken);
        this.setRefreshTokenCookie(response, refreshToken);
    }

    @Post('login')
    async login(
        @Body() data: LoginDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<void> {
        const { accessToken, refreshToken } = await this.authService.login(data);

        this.setAccessTokenCookie(response, accessToken);
        this.setRefreshTokenCookie(response, refreshToken);
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

        this.clearAccessTokenCookie(response);
        this.clearRefreshTokenCookie(response);
    }

    @Post('refresh')
    async refreshTokens(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<void> {
        const refreshToken = request.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is not in cookies');
        }

        const tokens: AuthDto = await this.authService.refreshTokens(refreshToken);

        this.setAccessTokenCookie(response, tokens.accessToken);
        this.setRefreshTokenCookie(response, tokens.refreshToken);
    }

    // приватные хелперы
    private setAccessTokenCookie(response: Response, accessToken: string): void {
        response.cookie('access_token', accessToken, {
            path: '/', // указываем бразеру эндпоинт куда в будущем слать куки
            httpOnly: true,
            secure: this.isProduction, // настройка для отправки только по HTTPS пока что выключил
            sameSite: 'lax', // защита от CSRF
            maxAge: 1000 * 60 * 20, // срок жизни куки 20 минут
        });
    }

    private clearAccessTokenCookie(response: Response): void {
        response.clearCookie('access_token', {
            path: '/',
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'lax',
        })
    }
    
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