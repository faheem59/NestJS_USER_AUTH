import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorator/public-decorator';
import { Cache } from 'cache-manager';
import { ERROR_MESSAGES } from '../../utils/error.message';
import { Common } from '../../utils/constants/common.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Common.CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_NOT_FOUND);
    }

    const tokenInRedis = await this.cacheManager.get(Common.ACCESS_TOKEN);
    if (!tokenInRedis) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }
    try {
      const user = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = user;
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === Common.BEARER ? token : undefined;
  }
}
