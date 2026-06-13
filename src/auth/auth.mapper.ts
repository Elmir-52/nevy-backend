import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { DatabaseRefreshToken } from "./interfaces/database-refresh-token";

export class AuthMapper {
    static toRefreshTokenEntity(databaseRefreshToken: DatabaseRefreshToken): RefreshTokenEntity {
        const entity = new RefreshTokenEntity;
        entity.userId = databaseRefreshToken.user_id;
        entity.token_hash = databaseRefreshToken.token_hash;
        entity.expiresAt = databaseRefreshToken.expires_at;
        entity.createdAt = databaseRefreshToken.created_at;
        return entity;
    }
}