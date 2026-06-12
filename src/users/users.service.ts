import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { CreateUserDto, UpdateUserDto, UserResponseDto } from "./dto";
import { SqlService } from "src/postgres/sql.service";
import { UsersMapper } from "./users.mapper";
import { DatabaseUser } from "./interfaces/database-user.interface";
import { UserEntity } from "./user.entity";

@Injectable()
export class UsersService {
    constructor(private sqlService: SqlService) {}

    async getOne(userId: string): Promise<UserEntity> {
        const [ dbUser ] = await this.sqlService.sql<DatabaseUser[]>`
            SELECT * FROM users
            WHERE user_id = ${userId};
        `;

        if (!dbUser) {
            throw new NotFoundException('User not found');
        }

        return UsersMapper.toUserEntity(dbUser);
    }

    async getUserByEmail(email: string): Promise<UserEntity | undefined> {
        const [ dbUser ] = await this.sqlService.sql<DatabaseUser[]>`
            SELECT * FROM users
            WHERE email = ${email};
        `;

        if (!dbUser) {
            return;
        }

        return UsersMapper.toUserEntity(dbUser);
    }

    async create(data: CreateUserDto): Promise<UserResponseDto> {
        const [ dbUser ] = await this.sqlService.sql<DatabaseUser[]>`
            INSERT INTO users 
            (email, password)
            VALUES (${data.email}, ${data.password})
            RETURNING * ;
        `;

        return UsersMapper.toUserResponseDTO(dbUser);
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