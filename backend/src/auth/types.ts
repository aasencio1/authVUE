// Tipo canónico del usuario autenticado que estará en req.user
export type AuthenticatedUser = {
  googleId: string;
  email: string;
  name?: string;
  photo?: string;
};

// Opcional: payload del JWT
export type JwtPayload = {
  sub: string; // mapeado desde googleId
  email: string;
  name?: string;
  photo?: string;
};
