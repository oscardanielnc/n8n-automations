import { Global, Module } from '@nestjs/common';
import { ENV, loadEnv } from '../config/env';
import { Clock } from './application/clock.port';
import { SharedFiles } from './application/shared-files.port';
import { FsSharedFiles } from './infrastructure/fs-shared-files';
import { N8nClient } from './infrastructure/n8n/n8n-client';
import { SystemClock } from './infrastructure/system-clock';
import { HealthController } from './presentation/health.controller';

@Global()
@Module({
  controllers: [HealthController],
  providers: [
    { provide: ENV, useFactory: () => loadEnv() },
    N8nClient,
    { provide: Clock, useClass: SystemClock },
    { provide: SharedFiles, useClass: FsSharedFiles },
  ],
  exports: [ENV, N8nClient, Clock, SharedFiles],
})
export class SharedModule {}
