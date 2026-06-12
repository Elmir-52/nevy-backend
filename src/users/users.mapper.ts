import { UserResponseDto } from "./dto";
import { DatabaseUser } from "./interfaces/database-user.interface";
import { UserEntity } from "./user.entity";

export class UsersMapper {
    static toUserResponseDTO(dbUser: DatabaseUser): UserResponseDto {
        const dto = new UserResponseDto();
        dto.userId = dbUser.user_id;
        dto.email = dbUser.email;
        dto.createdAt = dbUser.created_at;
        return dto;
    }

    static toUserEntity(dbUser: DatabaseUser): UserEntity {
        const entity = new UserEntity();
        entity.userId = dbUser.user_id;
        entity.email = dbUser.email;
        entity.password = dbUser.password;
        entity.createdAt = dbUser.created_at;
        return entity;
    }
}