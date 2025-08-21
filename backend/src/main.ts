import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('GOOGLE_CLIENT_ID?', (process.env.GOOGLE_CLIENT_ID || '').slice(0,12));
console.log('CALLBACK?', process.env.GOOGLE_CALLBACK_URL);

//  await app.listen(process.env.PORT ?? 3000);
 app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
