import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? `https://${process.env.PRODUCTION_HOST}`
        : `http://${process.env.LOCAL_HOST}:${process.env.LOCAL_PORT}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(process.env.LOCAL_PORT);
}
bootstrap();
