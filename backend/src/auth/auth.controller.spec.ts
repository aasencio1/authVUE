// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { ReqWithUser, AuthenticatedUser } from './types';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock de AuthService
  const authServiceMock = {
    signToken: jest.fn(),
  };

  const validUser: AuthenticatedUser = {
    googleId: 'g-123',
    email: 'user@example.com',
    name: 'User',
    photo: 'https://example.com/p.png',
  };

  // Evita la regla unbound-method usando variables para las funciones mock
  const createRes = () => {
    const status = jest.fn().mockReturnThis();
    const send = jest.fn();
    const redirect = jest.fn();
    const res = { status, send, redirect } as unknown as Response;
    return { res, status, send, redirect };
  };

  const OLD_ENV = process.env;

  beforeAll(() => {
    // Aislamos process.env entre tests
    process.env = { ...OLD_ENV, NODE_ENV: 'test' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe responder 401 cuando req.user es undefined', () => {
    const req = { user: undefined } as unknown as ReqWithUser;
    const { res, status, send, redirect } = createRes();

    controller.googleCallback(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({
      message: 'Google auth failed. Check server logs.',
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('debe responder 500 cuando FRONTEND_URL no está configurada', () => {
    const req = { user: validUser } as unknown as ReqWithUser;
    const { res, status, send, redirect } = createRes();
    delete process.env.FRONTEND_URL; // fuerza el 500

    controller.googleCallback(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith({ message: 'Server misconfigured.' });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('debe redirigir cuando hay usuario y FRONTEND_URL', () => {
    const req = { user: validUser } as unknown as ReqWithUser;
    const { res, status, send, redirect } = createRes();

    process.env.FRONTEND_URL = 'https://front.example.com';
    authServiceMock.signToken.mockReturnValue('tok-abc');

    controller.googleCallback(req, res);

    const expectedUrl = 'https://front.example.com/auth/success#token=tok-abc';

    expect(authServiceMock.signToken).toHaveBeenCalledWith(validUser);
    expect(redirect).toHaveBeenCalledWith(expectedUrl);
    expect(status).not.toHaveBeenCalled(); // flujo feliz no usa status/send
    expect(send).not.toHaveBeenCalled();
  });
});
