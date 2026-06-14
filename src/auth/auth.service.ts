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
            throw new InternalServerErrorException('Failed to create user');
        }
        
        return this.generateTokens(createdUser);
    }

    async login(data: LoginDto): Promise<AuthDto> {
        const user: UserEntity | undefined = await this.usersService.getUserByEmail(data.email);

        if (!user) {
            throw new UnauthorizedException('Email or password is invalid');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email or password is invalid');
        }

        return this.generateTokens(user);
    }

    async logout(rawRefreshToken: string): Promise<void> {
        if (!rawRefreshToken.includes(':')) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const userId = rawRefreshToken.split(':')[1];
        return await this.deleteRefreshTokens(userId);
    }

    async refreshTokens(rawRefreshToken: string): Promise<AuthDto> {
        if (!rawRefreshToken.includes(':')) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const userId = rawRefreshToken.split(':')[1];
        const hashedRefreshToken: string = this.hashToken(rawRefreshToken);
        const now: Date = new Date();

        const [ dbOldRefreshToken ] = await this.sqlService.sql<DatabaseRefreshToken[]>`
            SELECT * FROM refresh_tokens
            WHERE token_hash = ${hashedRefreshToken};
        `;

        if (!dbOldRefreshToken) {
            // если токен не найден, то удаляем абсолютно все токены пользователя
            await this.deleteRefreshTokens(userId);
            throw new UnauthorizedException('Invalid refresh token');
        }

        const oldRefreshToken: RefreshTokenEntity = AuthMapper.toRefreshTokenEntity(dbOldRefreshToken);

        const expiresAt = new Date(oldRefreshToken.expiresAt);
        if (expiresAt < now) {
            await this.deleteRefreshToken(oldRefreshToken.tokenHash);
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.deleteRefreshToken(oldRefreshToken.tokenHash);

        const user = await this.usersService.getOneByUserId(oldRefreshToken.userId);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return this.generateTokens(user);
    }

    // приватные хелперы
    private async createRefreshToken(user: UserEntity): Promise<string> {
        const rawRefreshToken: string = this.generateRefreshToken(user.userId);
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

    private async deleteRefreshToken(hashedRefreshToken: string) {
        await this.sqlService.sql`
            DELETE FROM refresh_tokens
            WHERE token_hash = ${hashedRefreshToken};
        `;
    }

    private async deleteRefreshTokens(userId: string) {
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

    private generateRefreshToken(userId: string): string {
        const randomPart = crypto.randomBytes(32).toString('hex');
        return `${randomPart}:${userId}`;
    }

    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }
}