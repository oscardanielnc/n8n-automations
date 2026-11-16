import { Controller, Get } from '@nestjs/common';
import { Vigia } from '@panel/contracts';
import { GetVigia } from '../application/use-cases/get-vigia.use-case';

@Controller('vigia')
export class VigiaController {
  constructor(private readonly getVigia: GetVigia) {}

  @Get()
  async get() {
    return Vigia.parse(await this.getVigia.execute());
  }
}
