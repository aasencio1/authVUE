// src/auth/google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from './types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = config.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing GOOGLE_* env vars');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): AuthenticatedUser {
    const googleId = profile.id;
    if (!googleId) {
      throw new UnauthorizedException('Invalid Google profile: missing id');
    }

    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    const name =
      profile.displayName && profile.displayName.length > 0
        ? profile.displayName
        : undefined;

    const photo = profile.photos?.[0]?.value ?? undefined;

    return {
      googleId,
      email,
      ...(name ? { name } : {}),
      ...(photo ? { photo } : {}),
    };
  }
}
