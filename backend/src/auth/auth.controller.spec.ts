import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

describe('AuthController (unit)', () => {
  let controller: AuthController;
  let authService: { signToken: jest.Mock };

  beforeEach(async () => {
    authService = {
      signToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Asegura una URL de frontend para la redirección
    process.env.FRONTEND_URL = 'http://localhost:5173';
    jest.clearAllMocks();
  });

  describe('googleCallback', () => {
    it('debe responder 401 cuando req.user es undefined', () => {
      // Mocks de Request/Response
      const req = { user: undefined } as unknown as Request;

      const status = jest.fn().mockReturnThis();
      const send = jest.fn().mockReturnThis();
      const res = { status, send } as unknown as Response;

      // Evitar ruido en consola (opcional)
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      controller.googleCallback(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(send).toHaveBeenCalledWith({
        message: 'Google auth failed. Check server logs.',
      });
      expect(authService.signToken).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('debe firmar token y hacer redirect cuando req.user existe', () => {
      const user = {
        googleId: 'g-123',
        email: 'user@gmail.com',
        name: 'User Test',
        photo: 'http://photo/avatar.png',
      };

      const req = { user } as unknown as Request;

      const redirect = jest.fn();
      const res = { redirect } as unknown as Response;

      authService.signToken.mockReturnValue('signed.jwt.token');

      controller.googleCallback(req, res);

      expect(authService.signToken).toHaveBeenCalledTimes(1);
      expect(authService.signToken).toHaveBeenCalledWith(user);

      const expectedUrl = `${process.env.FRONTEND_URL}/auth/success#token=signed.jwt.token`;
      expect(redirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('me', () => {
    it('debe devolver { user } desde req.user', () => {
      const req = {
        user: { id: 1, email: 'u@test.com' },
      } as unknown as Request;

      const result = controller.me(req);

      expect(result).toEqual({ user: { id: 1, email: 'u@test.com' } });
    });
  });
});
