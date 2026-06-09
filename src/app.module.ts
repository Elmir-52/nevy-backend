import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SqlModule } from './postgres/sql.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    UsersModule,
    NotesModule,
    SqlModule,
    
    ConfigModule.forRoot({
      isGlobal: true, // Делает модуль доступным во всем приложении
    }),
  ],
})
export class AppModule {}
