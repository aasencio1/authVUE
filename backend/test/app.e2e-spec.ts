// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ExecutionContext,
  UnauthorizedException,
  Logger, // 👈 para silenciar logs en tests
} from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GoogleAuthGuard } from '../src/auth/google.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { Request } from 'express';

// Tipos usados en los tests (ajusta si tus controladores usan otros)
type GoogleUser = {
  googleId: string;
  email: string;
  name: string;
  photo?: string;
};

type JwtUser = {
  id: number;
  email: string;
};

/** Helpers de seguridad de tipos para evitar `any` */
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function isJwtUser(v: unknown): v is JwtUser {
  return isObject(v) && typeof v.id === 'number' && typeof v.email === 'string';
}
/** Tipado seguro del http server para supertest */
function asHttpServer(v: unknown): Server {
  if (!v || typeof (v as { listen?: unknown }).listen !== 'function') {
    throw new Error('Invalid http.Server');
  }
  return v as Server;
}

describe('App E2E (Auth)', () => {
  let app: INestApplication;

  // Estado mutable para simular escenarios
  const state: {
    googleUser?: GoogleUser | null;
    jwtUser?: JwtUser;
    jwtAllow: boolean;
  } = {
    googleUser: undefined,
    jwtUser: undefined,
    jwtAllow: false,
  };

  let errorSpy: jest.SpyInstance;

  // Mock guard de Google: inyecta req.user si hay state.googleUser
  const GoogleGuardMock = {
    canActivate(ctx: ExecutionContext): boolean {
      const req = ctx
        .switchToHttp()
        .getRequest<Request & { user?: GoogleUser }>(); // <- tipa Request
      if (state.googleUser) req.user = state.googleUser;
      return true;
    },
  };

  // Mock guard de JWT: permite o no, e inyecta req.user si corresponde
  const JwtGuardMock = {
    canActivate(ctx: ExecutionContext): boolean {
      if (!state.jwtAllow) {
        throw new UnauthorizedException();
      }
      const req = ctx.switchToHttp().getRequest<Request & { user?: JwtUser }>(); // <- tipa Request
      if (state.jwtUser) req.user = state.jwtUser;
      return true;
    },
  };

  // 👇 Reset del estado entre pruebas para evitar contaminación
  beforeEach(() => {
    state.googleUser = undefined;
    state.jwtUser = undefined;
    state.jwtAllow = false;
  });

  beforeAll(async () => {
    process.env.FRONTEND_URL = 'http://localhost:5173';

    // 🔇 Silencia el logger global de Nest en pruebas
    Logger.overrideLogger(false);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue(GoogleGuardMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(JwtGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useLogger(false); // redundante pero inofensivo junto a overrideLogger(false)

    // Evita no-empty-function: retorna undefined explícitamente
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      return undefined as unknown as void;
    });

    await app.init();
  });

  afterAll(async () => {
    errorSpy?.mockRestore();
    await app.close();
  });

  describe('/auth/google/callback (GET)', () => {
    it('401 cuando NO hay req.user (fallo en Google)', async () => {
      state.googleUser = null; // no inyectar user
      const server = asHttpServer(app.getHttpServer());

      const res = await request(server)
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

      const server = asHttpServer(app.getHttpServer());

      const res = await request(server)
        .get('/auth/google/callback')
        .expect(302);

      // Usa API tipada de supertest para el header
      const location = res.get('Location') ?? '';
      const expected = `${process.env.FRONTEND_URL}/auth/success#token=`;
      expect(location.startsWith(expected)).toBe(true);
    });
  });

  describe('/auth/me (GET)', () => {
    it('401 cuando el JwtAuthGuard NO permite', async () => {
      state.jwtAllow = false;
      state.jwtUser = undefined;

      const server = asHttpServer(app.getHttpServer());
      await request(server).get('/auth/me').expect(401);
    });

    it('200 y devuelve { user } cuando el JwtAuthGuard permite', async () => {
      state.jwtAllow = true;
      state.jwtUser = { id: 1, email: 'u@test.com' };

      const server = asHttpServer(app.getHttpServer());

      const res = await request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer dummy')
        .expect(200);

      // Evitar no-unsafe-assignment: tratar body como unknown y validar
      const bodyUnknown: unknown = res.body;
      if (
        !isObject(bodyUnknown) ||
        !('user' in bodyUnknown) ||
        !isJwtUser((bodyUnknown as { user?: unknown }).user)
      ) {
        throw new Error('Unexpected response body shape');
      }
      const body = bodyUnknown as { user: JwtUser };

      expect(body).toEqual({ user: { id: 1, email: 'u@test.com' } });
    });
  });
});
