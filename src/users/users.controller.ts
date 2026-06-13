import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotImplementedException, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CreateUserDto, GetUserParamsDto, UpdateUserDto, UserResponseDto } from "./dto";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtPayloadDto } from "src/auth/dto/jwt-payload.dto";
import { UserEntity } from "./entities/user.entity";

@Controller('users')
export class UsersController {
    constructor(private usersServise: UsersService) {}

    @Get('me')
    @UseGuards(AuthGuard)
    getProfile(@Request() req) {
        const requestUser: JwtPayloadDto = req.user;
        return this.usersServise.getOneToResponse(requestUser.userId);
    }

    @Post()
    async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
        const user: UserEntity = await this.usersServise.create(data);
        return this.usersServise.getOneToResponse(user.userId);
    } 

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
    delete(@Request() req): Promise<void> {
        const requestUser: JwtPayloadDto = req.user;
        return this.usersServise.delete(requestUser.userId);
    }
}