import { GetUserDto } from "./dto";
import { DatabaseUser } from "./interfaces/database-user.interface";

export class UsersMapper {
    static toGetUserDTO(dbUser: DatabaseUser): GetUserDto {
        const dto = new GetUserDto();
        dto.userId = dbUser.user_id;
        dto.email = dbUser.email;
        dto.createdAt = dbUser.created_at;
        return dto;
    }
}