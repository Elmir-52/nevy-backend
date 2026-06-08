import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SqlModule } from './postgres/sql.module';

@Module({
  imports: [
    UsersModule,
    SqlModule,
    ConfigModule.forRoot({
      isGlobal: true, // Делает модуль доступным во всем приложении
    }),
  ],
})
export class AppModule {}
