import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Global()
@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule], // импортируем модуль конфигурации
            inject: [ConfigService], // внедряем сервис конфигурации
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '600s' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [JwtModule, AuthService]
})
export class AuthModule {}