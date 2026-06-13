import { UserResponseDto } from "./dto";
import { DatabaseUser } from "./interfaces/database-user.interface";
import { UserEntity } from "./entities/user.entity";

export class UsersMapper {
    static toUserResponseDTO(userEntity: UserEntity): UserResponseDto {
        const dto = new UserResponseDto();
        dto.userId = userEntity.userId;
        dto.email = userEntity.email;
        dto.createdAt = userEntity.createdAt;
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