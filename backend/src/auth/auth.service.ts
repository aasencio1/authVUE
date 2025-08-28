// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type GoogleUser = {
  googleId: string;
  email: string;
  name?: string;
  photo?: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  name?: string;
  photo?: string;
};

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  signToken(user: GoogleUser): string {
    const payload: JwtPayload = {
      sub: user.googleId,
      email: user.email,
      name: user.name ?? '',
      photo: user.photo,
    };
    return this.jwt.sign(payload);
  }
}
