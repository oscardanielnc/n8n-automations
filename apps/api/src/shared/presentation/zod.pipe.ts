import { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { DomainError } from '../domain/domain-error';

/** Validates a request body against its contract schema; the API never trusts the web's own validation. */
export class ZodPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const r = this.schema.safeParse(value);
    if (!r.success) throw new DomainError('invalid_body', r.error.issues.map((i) => i.message).join('; '), 400);
    return r.data;
  }
}
