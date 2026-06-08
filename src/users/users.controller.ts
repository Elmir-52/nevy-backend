import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotImplementedException, Param, Patch, Post } from "@nestjs/common";
import { CreateUserDto, GetUserDto, GetUserParamsDto, UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly usersServise: UsersService) {}

    @Get(':userId')
    getOne(@Param() { userId }: GetUserParamsDto): Promise<GetUserDto> {
        return this.usersServise.getOne(userId);
    }

    @Post()
    async create(@Body() data: CreateUserDto): Promise<GetUserDto> {
        const userId = await this.usersServise.create(data);
        return this.usersServise.getOne(userId);
    }

    @Patch(':userId')
    async update(
        @Param() { userId }: GetUserParamsDto, 
        @Body() data: UpdateUserDto
    ): Promise<GetUserDto> {
        await this.usersServise.update(userId, data);
        return this.usersServise.getOne(userId);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param() { userId }: GetUserParamsDto): Promise<void> {
        return this.usersServise.delete(userId);
    }
}