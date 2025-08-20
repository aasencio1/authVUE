// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    });
  }

  async validate(_at: string, _rt: string, profile: Profile) {
    const rawPhoto = profile.photos?.[0]?.value;
    // Aumenta tamaño si viene como "=s96-c"; si no trae query, agrega "?sz=200"
    let photo = rawPhoto;
    if (photo) {
      if (/=s\d+-c/.test(photo)) {
        photo = photo.replace(/=s\d+-c/, '=s200-c');
      } else if (!/[?&]sz=/.test(photo)) {
        photo += (photo.includes('?') ? '&' : '?') + 'sz=200';
      }
    }

    const email = profile.emails?.[0]?.value;
    return {
      provider: 'google',
      googleId: profile.id,
      email,
      name: profile.displayName,
      photo,
    };
  }
}
