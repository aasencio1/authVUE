// src/auth/google.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, _ctx: ExecutionContext) {
    if (err) console.error('GoogleAuth error:', err);
    if (info) console.error('GoogleAuth info:', info);
    return user;
  }
}
