// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, AuthenticatedUser } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // 👇 Devolver AuthenticatedUser (no GoogleUser)
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      googleId: payload.sub,
      email: payload.email,
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.photo !== undefined ? { photo: payload.photo } : {}),
    };
  }
}
