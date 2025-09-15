// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { GoogleUser, JwtPayload } from './types'; // 👈 usa los tipos
// compartidos

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  signToken(user: GoogleUser): string {
    const payload: JwtPayload = {
      sub: user.googleId,
      email: user.email,
      ...(user.name !== undefined ? { name: user.name } : {}),
      ...(user.photo !== undefined ? { photo: user.photo } : {}),
    };

    return this.jwt.sign(payload);
  }
}
