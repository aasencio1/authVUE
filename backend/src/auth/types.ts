// ÚNICA fuente de verdad de tipos
import type { Request } from 'express';

export type AuthenticatedUser = {
  googleId: string;
  email: string;
  name?: string; // opcional
  photo?: string; // opcional
};

export type JwtPayload = {
  sub: string; // = googleId
  email: string;
  name?: string;
  photo?: string;
};

// (si ya usabas GoogleUser en otros sitios, aliaséalo aquí)
export type GoogleUser = AuthenticatedUser;

export type ReqWithUser = Request & {
  user?: AuthenticatedUser | undefined;
};
/*export type GoogleUser = {
  googleId: string;
  email: string;
  name?: string;
  photo?: string;
};*/
