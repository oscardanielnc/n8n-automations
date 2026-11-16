import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { OverviewModule } from './modules/overview/overview.module';
import { RunsModule } from './modules/runs/runs.module';
import { ServerModule } from './modules/server/server.module';
import { VigiaModule } from './modules/vigia/vigia.module';
import { SharedModule } from './shared/shared.module';
import { AccessGuard } from './shared/presentation/access.guard';
import { ProblemDetailsFilter } from './shared/presentation/problem-details.filter';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: ['req.headers["cf-access-jwt-assertion"]', 'req.headers.cookie'],
        autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 240 }]),
    ServeStaticModule.forRoot({ rootPath: process.env.WEB_DIST ?? '/app/web', exclude: ['/api/{*path}'] }),
    SharedModule,
    RunsModule,
    VigiaModule,
    ServerModule,
    OverviewModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AccessGuard },
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
  ],
})
export class AppModule {}
