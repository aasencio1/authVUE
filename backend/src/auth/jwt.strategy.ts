// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = {
  sub: string;
  email: string;
  name?: string;
  photo?: string;
};

export type GoogleUser = {
  googleId: string;
  email: string;
  name?: string;
  photo?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('JWT_SECRET'); // <-- garantiza string

    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      // algorithms: ['HS256'], // descomenta si quieres fijar explícitamente
    };

    super(opts);
  }

  // Lo que retornes aquí queda en req.user
  validate(payload: JwtPayload): GoogleUser {
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? '',
      photo: payload.photo,
    };
  }
}
