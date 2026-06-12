import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { LogingDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { UserEntity } from "src/users/user.entity";
import bcrypt from 'bcrypt'
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto } from "src/users/dto";
import * as crypto from 'crypto';
import { RefreshTokenEntity } from "./entities/refresh-token.entity";
import { SqlService } from "src/postgres/sql.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private sqlService: SqlService,
    ) {}

    async register(data: RegisterDto): Promise<AuthResponseDto> {
        const user: UserEntity | undefined = await this.usersService.getUserByEmail(data.email);

        if (user) {
            throw new ConflictException('User already exists');
        }

        const hashPassword = await bcrypt.hash(data.password, 10);

        const createUser = new CreateUserDto();
        createUser.email = data.email;
        createUser.password = hashPassword;

        const createdUser = await this.usersService.create(createUser);

        const getUser: UserEntity | undefined = await this.usersService.getUserByEmail(createdUser.email);

        if (getUser) {
            return this.generateTokens(getUser);
        }

        throw new InternalServerErrorException('Internal server error');
    }

    async login(data: LogingDto): Promise<AuthResponseDto> {
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

    async updateTokens(rawRefreshToken: string): Promise<AuthResponseDto> {
        const hashedRefreshToken = this.hashToken(rawRefreshToken);
        const now = new Date();

        const [ oldRefreshToken ] = await this.sqlService.sql`
            SELECT * FROM refresh_tokens
            WHERE token_hash = ${hashedRefreshToken};
        `;

        const expiresAt = new Date(oldRefreshToken?.expires_at);

        if (!oldRefreshToken || expiresAt < now) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.usersService.getOne(oldRefreshToken.user_id);

        return this.generateTokens(user);
    }

    private generateRefreshToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    private async createRefreshToken(user: UserEntity) {
        const rawRefreshToken = this.generateRefreshToken();
        const hashedRefreshToken = this.hashToken(rawRefreshToken);

        const rawExpiresAt = new Date();
        rawExpiresAt.setDate(rawExpiresAt.getDate() + 30);
        const expiresAt = rawExpiresAt.toISOString();

        await this.sqlService.sql`
            DELETE FROM refresh_tokens
            WHERE user_id = ${user.userId};
        `;

        await this.sqlService.sql`
            INSERT INTO refresh_tokens
            (user_id, token_hash, expires_at)
            VALUES (${user.userId}, ${hashedRefreshToken}, ${expiresAt});
        `;

        return rawRefreshToken;
    }

    private async generateTokens(user: UserEntity): Promise<AuthResponseDto> {
        const payload = {
            userId: user.userId,
            email: user.email,
        }

        const accessToken = await this.jwtService.signAsync(payload);
        const rawRefreshToken = await this.createRefreshToken(user);

        return new AuthResponseDto(accessToken, rawRefreshToken);
    }
}