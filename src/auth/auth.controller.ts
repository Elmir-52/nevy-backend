import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto, GetAuthParams, LoginDto, RegisterDto } from "./dto";
import type { Request, Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {} 

    @Post('register')
    async register(
        @Body() data: RegisterDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const { accessToken, refreshToken } = await this.authService.register(data);

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict',
            path: '/auth/refresh',
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });

        return { accessToken };
    }

    @Post('login')
    async login(
        @Body() data: LoginDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const { accessToken, refreshToken } = await this.authService.login(data);

        response.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            // secure: true, // настройка для отправки только по HTTPS пока что выключил
            sameSite: 'strict', // защита от CSRF
            path: '/auth/refresh', // указываем бразеру эндпоинт куда в будущем слать куки
            maxAge: 1000 * 60 * 60 * 24 * 30, // срок жизни куки
        });

        return { accessToken };
    }

    @Post('logout/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@Param() { userId }: GetAuthParams): Promise<void> {
        return this.authService.logout(userId);
    }

    @Post('refresh')
    async updateTokens(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    ): Promise<AuthResponseDto> {
        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is not in cookies');
        }

        const tokens = await this.authService.updateTokens(refreshToken);

        response.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            // secure: true,
            sameSite: 'strict',
            path: '/auth/refresh',
            maxAge: 1000 * 60 * 60 * 24 * 30,
        })

        return { accessToken: tokens.accessToken };
    }
}