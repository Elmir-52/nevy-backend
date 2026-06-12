import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotImplementedException, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CreateUserDto, GetUserParamsDto, UpdateUserDto, UserResponseDto } from "./dto";
import { UsersService } from "./users.service";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtPayloadDto } from "src/auth/dto/jwt-payload.dto";

@Controller('users')
export class UsersController {
    constructor(private usersServise: UsersService) {}

    // @Get(':userId')
    // getOne(@Param() { userId }: GetUserParamsDto): Promise<UserResponseDto> {
    //     return this.usersServise.getOne(userId);
    // }

    @Get('me')
    @UseGuards(AuthGuard)
    getProfile(@Request() req) {
        const requestUser: JwtPayloadDto = req.user;
        return this.usersServise.getOne(requestUser.userId);
    }

    @Post()
    async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
        return this.usersServise.create(data);
    } 

    @Patch(':userId')
    async update(
        @Param() { userId }: GetUserParamsDto, 
        @Body() data: UpdateUserDto
    ): Promise<UserResponseDto> {
        await this.usersServise.update(userId, data);
        return this.usersServise.getOne(userId);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param() { userId }: GetUserParamsDto): Promise<void> {
        return this.usersServise.delete(userId);
    }
}