// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

// Tipo mínimo para el usuario que firma el token
type GoogleUser = {
  googleId: string;
  email: string;
  name?: string;
  photo?: string;
};

let service: AuthService;
let jwtService: jest.Mocked<JwtService>;

beforeEach(async () => {
  const testingModule: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: JwtService,
        useValue: {
          sign: jest.fn(), // mock del método que usamos
        },
      },
    ],
  }).compile();

  service = testingModule.get<AuthService>(AuthService);
  jwtService = testingModule.get(JwtService);
  jest.clearAllMocks();
});

it('debe construir el payload correcto y firmarlo', () => {
  const user: GoogleUser = {
    googleId: 'g-123',
    email: 'user@gmail.com',
    name: 'User Test',
    photo: 'http://photo.example/avatar.png',
  };

  const expectedPayload = {
    sub: user.googleId,
    email: user.email,
    name: user.name,
    photo: user.photo,
  };

  const signSpy = jest
    .spyOn(jwtService, 'sign')
    .mockReturnValue('signed.jwt.token');

  const token = service.signToken(user);

  expect(signSpy).toHaveBeenCalledTimes(1);
  expect(signSpy).toHaveBeenCalledWith(expectedPayload);
  expect(token).toBe('signed.jwt.token');
});

it('debe tolerar campos opcionales (por ejemplo, photo ausente)', () => {
  const user: GoogleUser = {
    googleId: 'g-456',
    email: 'no-photo@gmail.com',
    name: 'No Photo',
  };

  const signSpy = jest
    .spyOn(jwtService, 'sign')
    .mockReturnValue('another.token');

  const token = service.signToken(user);

  expect(signSpy).toHaveBeenCalledWith({
    sub: 'g-456',
    email: 'no-photo@gmail.com',
    name: 'No Photo',
    photo: undefined,
  });
  expect(token).toBe('another.token');
});
