import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto";
import { SqlService } from "src/postgres/sql.service";
import { UsersMapper } from "./users.mapper";
import { DatabaseUser } from "./interfaces/database-user.interface";

@Injectable()
export class UsersService {
    constructor(private sqlService: SqlService) {}

    async getOne(userId: string): Promise<UserResponseDto> {
        const [ dbUser ] = await this.sqlService.sql<DatabaseUser[]>`
            SELECT * FROM users
            WHERE user_id = ${userId};
        `;

        if (!dbUser) {
            throw new NotFoundException('User not found');
        }

        return UsersMapper.toUserResponseDTO(dbUser);
    }

    async create(data: CreateUserDto): Promise<string> {
        const [ dbUser ] = await this.sqlService.sql`
            INSERT INTO users 
            (email, password, created_at)
            VALUES (${data.email}, ${data.password}, ${data.createdAt})
            RETURNING * ;
        `;

        return dbUser.user_id;
    }

    async update(userId: string, data: UpdateUserDto): Promise<void> {
        await this.sqlService.sql`
            UPDATE users
            SET password = ${data.password}
            WHERE user_id = ${userId};
        `;
    }

    async delete(userId: string): Promise<void> {
        await this.sqlService.sql`
            DELETE FROM users
            WHERE user_id = ${userId};
        `
    }
}