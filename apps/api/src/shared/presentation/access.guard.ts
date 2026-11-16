import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ENV, Env } from '../../config/env';
import { IS_PUBLIC } from './public.decorator';

/**
 * Cloudflare Access sits in front of the panel (ADR 0002). Access adds a signed JWT to every request it lets
 * through; checking its signature, audience and issuer here means a request that bypassed Access (misrouted
 * tunnel, direct port) is still rejected.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    @Inject(ENV) private readonly env: Env,
    private readonly reflector: Reflector,
  ) {
    if (!env.AUTH_DISABLED && env.ACCESS_TEAM_DOMAIN)
      this.jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', env.ACCESS_TEAM_DOMAIN));
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.env.AUTH_DISABLED) return true;
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()])) return true;
    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.header('cf-access-jwt-assertion');
    if (!token || !this.jwks) throw new UnauthorizedException('Missing Cloudflare Access token');
    try {
      await jwtVerify(token, this.jwks, { audience: this.env.ACCESS_AUD, issuer: this.env.ACCESS_TEAM_DOMAIN });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid Cloudflare Access token');
    }
  }
}
