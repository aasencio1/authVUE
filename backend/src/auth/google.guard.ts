// src/auth/google.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// Ajusta la ruta del import según dónde tengas el tipo:
import { GoogleUser } from './jwt.strategy'; // p.ej. '../auth/strategies/jwt.strategy'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Nota: si no usas `context`, no lo declares
  handleRequest<TUser = GoogleUser>(err: any, user: any, info: any): TUser {
    if (err) console.error('GoogleAuth error:', err);
    if (info) console.error('GoogleAuth info:', info);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user as TUser;
  }
}
