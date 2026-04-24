import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: 'http://localhost:5173' });
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(3000);
  console.log('Backend rodando em http://localhost:3000');
}
void bootstrap();
