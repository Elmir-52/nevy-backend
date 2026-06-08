import { UserResponseDto } from "./dto";
import { DatabaseUser } from "./interfaces/database-user.interface";

export class UsersMapper {
    static toUserResponseDTO(dbUser: DatabaseUser): UserResponseDto {
        const dto = new UserResponseDto();
        dto.userId = dbUser.user_id;
        dto.email = dbUser.email;
        dto.createdAt = dbUser.created_at;
        return dto;
    }
}