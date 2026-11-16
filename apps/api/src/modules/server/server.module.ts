import { Module } from '@nestjs/common';
import { HealthSource, JobRadarSource } from './application/ports/server.sources';
import { GetJobRadar } from './application/use-cases/get-job-radar.use-case';
import { GetServerHealth } from './application/use-cases/get-server-health.use-case';
import { FileHealthSource, FileJobRadarSource } from './infrastructure/file-server.sources';
import { ServerController } from './presentation/server.controller';

@Module({
  controllers: [ServerController],
  providers: [
    GetServerHealth,
    GetJobRadar,
    { provide: HealthSource, useClass: FileHealthSource },
    { provide: JobRadarSource, useClass: FileJobRadarSource },
  ],
})
export class ServerModule {}
