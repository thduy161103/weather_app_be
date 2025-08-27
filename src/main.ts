import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS using frontend URL from environment
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get('FRONTEND_URL') as string;
  app.enableCors({ origin: frontendUrl });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => console.error('Nest bootstrap error:', err));
