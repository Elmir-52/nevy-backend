import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotImplementedException, Param, Patch, Post, Request, Res, UseGuards } from "@nestjs/common";
import { CreateUserDto, GetUserParamsDto, UpdateUserDto, UserResponseDto } from "./dto";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtPayloadDto } from "src/auth/dto/jwt-payload.dto";
import { UserEntity } from "./entities/user.entity";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import type { Response } from "express";
import { ConfigService } from "@nestjs/config";

@Controller('users')
export class UsersController {
    private readonly isProduction: boolean;

    constructor(
        private usersServise: UsersService,
        private configService: ConfigService
    ) {
        this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    }

    @Get('me')
    @UseGuards(AuthGuard)
    getProfile(@CurrentUser() user: JwtPayloadDto) {
        return this.usersServise.getOneToResponse(user.userId);
    }

    // пока что эндпоинт создания не нужен
    // @Post()
    // async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    //     const user: UserEntity = await this.usersServise.create(data);
    //     return this.usersServise.getOneToResponse(user.userId);
    // }

    // Пока что убираем изменение пароля, пока не встроена двойная аутентификация
    // @Patch('me')
    // @UseGuards(AuthGuard)
    // async update(@Request() req, @Body() data: UpdateUserDto): Promise<UserResponseDto> {
    //     const requestUser: JwtPayloadDto = req.user;
    //     await this.usersServise.update(requestUser.userId, data);
    //     return this.usersServise.getOneToResponse(requestUser.userId);
    // }

    @Delete('me')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(
        @CurrentUser() user: JwtPayloadDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<void> {
        this.clearAccessTokenCookie(response);
        this.clearRefreshTokenCookie(response);
        return this.usersServise.delete(user.userId);
    }

    private clearAccessTokenCookie(response: Response): void {
        response.clearCookie('access_token', {
            path: '/',
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'lax',
        })
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