// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

export type GoogleUser = {
  provider: 'google';
  googleId: string;
  email: string | null;
  name: string | null;
  photo: string | null;
};

// ------ Type guards / helpers SIN `any` ------
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function firstStringFromValueArray(arr: unknown): string | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  // ⚠️ Importante: indexar como unknown[] para evitar `any`
  const first: unknown = (arr as unknown[])[0];
  if (!isObject(first)) return null;
  const val = (first as { value?: unknown }).value;
  return typeof val === 'string' && val.length > 0 ? val : null;
}

function toNonEmptyString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing GOOGLE_* env vars');
    }

    // Algunas configs estrictas marcan `super(...)` como unsafe-call.
    // Deshabilitamos SOLO esta línea.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
    profile: unknown,
  ): GoogleUser {
    void _accessToken;
    void _refreshToken;

    // profile debe ser objeto
    if (!isObject(profile)) {
      throw new Error('Invalid Google profile: not an object');
    }

    // id como string no vacío
    const idVal = (profile as { id?: unknown }).id;
    const googleId = toNonEmptyString(idVal);
    if (!googleId) {
      throw new Error('Invalid Google profile: missing id');
    }

    // email
    const emails = (profile as { emails?: unknown }).emails;
    const email = firstStringFromValueArray(emails);

    // photo (sin normalizaciones para evitar llamadas sospechosas)
    const photos = (profile as { photos?: unknown }).photos;
    const photo = firstStringFromValueArray(photos);

    // displayName
    const displayNameRaw = (profile as { displayName?: unknown }).displayName;
    const name = toNonEmptyString(displayNameRaw);

    return {
      provider: 'google',
      googleId,
      email,
      name,
      photo,
    };
  }
}
