import { Module } from '@nestjs/common';
import { VigiaRepository } from './application/ports/vigia.repository';
import { GetVigia } from './application/use-cases/get-vigia.use-case';
import { N8nVigiaRepository } from './infrastructure/n8n-vigia.repository';
import { VigiaController } from './presentation/vigia.controller';

@Module({
  controllers: [VigiaController],
  providers: [GetVigia, { provide: VigiaRepository, useClass: N8nVigiaRepository }],
})
export class VigiaModule {}
