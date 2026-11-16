import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../domain/domain-error';
import { N8nUnavailableError } from '../infrastructure/n8n/n8n-client';

/** Every error leaves the API as RFC 9457 Problem Details with a stable `code` for the web. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly log = new Logger('Problem');

  catch(err: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal';
    let detail = 'Unexpected error';
    if (err instanceof DomainError) {
      status = err.status;
      code = err.code;
      detail = err.message;
    } else if (err instanceof N8nUnavailableError) {
      status = HttpStatus.BAD_GATEWAY;
      code = 'n8n_unavailable';
      detail = 'n8n did not answer';
      this.log.warn(err.message);
    } else if (err instanceof HttpException) {
      status = err.getStatus();
      code = status === 401 ? 'unauthorized' : status === 404 ? 'not_found' : 'http_error';
      const body = err.getResponse();
      detail = typeof body === 'string' ? body : String((body as { message?: unknown }).message ?? err.message);
    } else {
      this.log.error(err);
    }
    res
      .status(status)
      .type('application/problem+json')
      .json({ type: 'about:blank', title: HttpStatus[status] ?? 'Error', status, detail, code });
  }
}
