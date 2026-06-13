import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { UserEntity } from "src/users/entities/user.entity";
import bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "src/users/dto";
import * as crypto from 'crypto';
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { SqlService } from "src/postgres/sql.service";
import { DatabaseRefreshToken } from "./interfaces/database-refresh-token";
import { AuthMapper } from "./auth.mapper";
import { AuthDto, JwtPayloadDto, LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private sqlService: SqlService,
    ) {}

    async register(data: RegisterDto): Promise<AuthDto> {
        const user: UserEntity | undefined = await this.usersService.getUserByEmail(data.email);

        if (user) {
            throw new ConflictException('User already exists');
        }

        const hashPassword = await bcrypt.hash(data.password, 10);

        const createUser = new CreateUserDto();
        createUser.email = data.email;
        createUser.password = hashPassword;

        const createdUser: UserEntity = await this.usersService.create(createUser);
        if (!createdUser) {
            throw new InternalServerErrorException('Internal server error');
        }
        
        return this.generateTokens(createdUser);
    }

    async login(data: LoginDto): Promise<AuthDto> {
        const user: UserEntity | undefined = await this.usersService.getUserByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email or password is invalid');
        }

        return this.generateTokens(user);
    }

    async logout(userId: string): Promise<void> {
        await this.deleteRefreshTokens(userId);
    }

    async updateTokens(rawRefreshToken: string): Promise<AuthDto> {
        const hashedRefreshToken: string = this.hashToken(rawRefreshToken);
        const now: Date = new Date();

        const [ dbOldRefreshToken ] = await this.sqlService.sql<DatabaseRefreshToken[]>`
            SELECT * FROM refresh_tokens
            WHERE token_hash = ${hashedRefreshToken};
        `;

        await this.deleteRefreshTokens(dbOldRefreshToken.user_id);

        if (!dbOldRefreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const oldRefreshToken: RefreshTokenEntity = AuthMapper.toRefreshTokenEntity(dbOldRefreshToken);

        const expiresAt = new Date(oldRefreshToken.createdAt);
        if (expiresAt > now) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.usersService.getOneByUserId(oldRefreshToken.userId);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return this.generateTokens(user);
    }

    // приватные методы сервиса
    private async createRefreshToken(user: UserEntity): Promise<string> {
        await this.deleteRefreshTokens(user.userId);

        const rawRefreshToken: string = this.generateRefreshToken();
        const hashedRefreshToken: string = this.hashToken(rawRefreshToken);

        const rawExpiresAt: Date = new Date();
        rawExpiresAt.setDate(rawExpiresAt.getDate() + 30); // срок жизни рефреша 30 дней
        const expiresAt: string = rawExpiresAt.toISOString();

        await this.sqlService.sql`
            INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at)
            VALUES (${user.userId}, ${hashedRefreshToken}, ${expiresAt});
        `;

        return rawRefreshToken;
    }

    private async deleteRefreshTokens(userId: string) {
        // удаляем абсолютно все рефреши юзера (для безопасности)
        await this.sqlService.sql`
            DELETE FROM refresh_tokens
            WHERE user_id = ${userId};
        `;
    }

    private async generateTokens(user: UserEntity): Promise<AuthDto> {
        // payload нельзя создавать через new JwtPayloadDto, иначе будет ошибка
        const payload: JwtPayloadDto = {
            userId: user.userId,
            email: user.email,
        }

        const accessToken: string = await this.jwtService.signAsync(payload);
        const rawRefreshToken: string = await this.createRefreshToken(user);

        return new AuthDto(accessToken, rawRefreshToken);
    }

    // вспомогательные методы
    private generateRefreshToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }
}