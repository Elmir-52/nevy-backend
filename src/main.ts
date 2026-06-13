import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseExceptionFilter } from './database-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  app.useGlobalFilters(new DatabaseExceptionFilter());
  app.enableShutdownHooks();

  app.use(cookieParser());
  app.enableCors({
    origin: '*', // на проде поменять на url нашего фронтенда
    credentials: true, // разрешаем куки
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
