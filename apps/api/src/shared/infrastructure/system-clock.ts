import { Injectable } from '@nestjs/common';
import { Clock } from '../application/clock.port';
import { limaDate } from '../domain/dates';

@Injectable()
export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
  today(): string {
    return limaDate(new Date());
  }
}
