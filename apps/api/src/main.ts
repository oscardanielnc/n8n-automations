import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const env = loadEnv(); // fail fast before anything starts
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { 'default-src': ["'self'"], 'img-src': ["'self'", 'data:'], 'style-src': ["'self'", "'unsafe-inline'"] },
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(env.PORT, '0.0.0.0');
}

void bootstrap();
