import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SqlModule } from './postgres/sql.module';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делает модуль доступным во всем приложении
    }),
    SqlModule,

    UsersModule,
    NotesModule,
    AuthModule,
  ],
})
export class AppModule {}
