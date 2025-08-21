// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthGuard } from '../src/auth/google.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

describe('App E2E (Auth)', () => {
  let app: INestApplication;

  // Estado mutable para simular distintos escenarios en los guards
  const state: {
  googleUser?: { googleId: string; email: string; name: string; photo?: string } | null;
  jwtUser?: any;
  jwtAllow: boolean;
} = {
  googleUser: undefined,
  jwtUser: undefined,
  jwtAllow: false,
};

let errorSpy: jest.SpyInstance; // <-- ADDED
  // Mock guard de Google: si hay state.googleUser, la inyecta en req.user
  const GoogleGuardMock = {
    canActivate(ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest();
      if (state.googleUser) req.user = state.googleUser;
      return true; // deja pasar para que el controller maneje
    },
  };

  // Mock guard de JWT: permite o no, e inyecta req.user si corresponde
   
  const JwtGuardMock = {
  canActivate(ctx: ExecutionContext) {
    if (!state.jwtAllow) {
      // Para emular AuthGuard('jwt') de Passport → 401 Unauthorized
      throw new UnauthorizedException();
    }
    const req = ctx.switchToHttp().getRequest();
    if (state.jwtUser) req.user = state.jwtUser;
    return true;
  },
};

  beforeAll(async () => {
    // FRONTEND_URL que tu controller usa para redirigir
    process.env.FRONTEND_URL = 'http://localhost:5173';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue(GoogleGuardMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(JwtGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useLogger(false);                 // <-- ADDED: apaga logger de Nest en E2E
    errorSpy = jest                       // <-- ADDED: silencia console.error
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await app.init();
  });

  afterAll(async () => {
    errorSpy?.mockRestore();              // <-- ADDED: restaura console.error
    await app.close();
  });

  describe('/auth/google/callback (GET)', () => {
    it('401 cuando NO hay req.user (fallo en Google)', async () => {
      state.googleUser = null; // no inyectar user
      const res = await request(app.getHttpServer())
        .get('/auth/google/callback')
        .expect(401);

      expect(res.body).toEqual({
        message: 'Google auth failed. Check server logs.',
      });
    });

    it('302 redirect cuando SÍ hay req.user', async () => {
      state.googleUser = {
        googleId: 'g-123',
        email: 'user@gmail.com',
        name: 'User Test',
        photo: 'http://photo/avatar.png',
      };

      const res = await request(app.getHttpServer())
        .get('/auth/google/callback')
        .expect(302);

      // Verifica la URL de redirección que arma el controller
      const expected = `${process.env.FRONTEND_URL}/auth/success#token=`;
      expect(res.headers.location.startsWith(expected)).toBe(true);

      // (Opcional) podrías decodificar el fragmento y validar forma,
      // pero aquí basta con verificar prefijo de la URL
    });
  });

  describe('/auth/me (GET)', () => {
    it('401 cuando el JwtAuthGuard NO permite', async () => {
      state.jwtAllow = false;
      state.jwtUser = undefined;

      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('200 y devuelve { user } cuando el JwtAuthGuard permite', async () => {
      state.jwtAllow = true;
      state.jwtUser = { id: 1, email: 'u@test.com' };

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer dummy') // simulado
        .expect(200);

      expect(res.body).toEqual({ user: { id: 1, email: 'u@test.com' } });
    });
  });
});
