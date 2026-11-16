import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from './public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @SkipThrottle()
  get() {
    return { status: 'ok' };
  }
}
