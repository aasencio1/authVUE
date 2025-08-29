// src/auth/google.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './types';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override handleRequest<TUser = GoogleUser>(
    err: unknown,
    user: unknown,
    info: unknown,
    _context?: unknown, // 👈 prefijo _
    _status?: unknown,  // 👈 prefijo _
  ): TUser {
    if (err) console.error('GoogleAuth error:', err);
    if (info) console.error('GoogleAuth info:', info);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user as TUser;
  }
}
