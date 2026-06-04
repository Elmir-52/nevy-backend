import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from "@nestjs/common";
import { CreateUserDto, GetUserDto, GetUserParams, UpdateUserDto } from "./dto";
import { UsersService } from "./users.service";

@Controller('users')
export class UsersController {
    constructor(private readonly usersServise: UsersService) {}

    @Get(':userId')
    getOne(@Param() { userId }: GetUserParams): Promise<GetUserDto> {
        return this.usersServise.getOne(userId);
    }

    @Post()
    async create(@Body() data: CreateUserDto): Promise<GetUserDto> {
        const userId = await this.usersServise.create(data);
        return this.usersServise.getOne(userId);
    }

    @Patch()
    async update(
        @Param() { userId }: GetUserParams, 
        @Body() data: UpdateUserDto
    ): Promise<GetUserDto> {
        await this.usersServise.update(data);
        return this.usersServise.getOne(userId);
    }

    @Delete()
    delete(@Param() { userId }: GetUserParams): Promise<void> {
        return this.usersServise.delete(userId);
    }
}