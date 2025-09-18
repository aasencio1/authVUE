import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontend = process.env.FRONTEND_URL;
  if (!frontend) {
    console.error('FRONTEND_URL no está configurada');
    process.exit(1);
  }

  app.enableCors({
    origin: frontend, // <-- solo tu dominio
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(process.env.PORT || 4000);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
