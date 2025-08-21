import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';


let service: AuthService;
let jwtService: jest.Mocked<JwtService>;

const jwtMock = {
  sign: jest.fn(),
} as unknown as jest.Mocked<JwtService>;



beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: JwtService, useValue: jwtMock },
    ],
  }).compile();

  service = module.get<AuthService>(AuthService);
  jwtService = module.get(JwtService);
  jest.clearAllMocks();
});
// Caso de Prueba 1
it('debe construir el payload correcto y firmarlo', () => {
  const user = {
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

  jwtService.sign.mockReturnValue('signed.jwt.token');

  const token = service.signToken(user);

  expect(jwtService.sign).toHaveBeenCalledTimes(1);
  expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
  expect(token).toBe('signed.jwt.token');
});
//Caso de Prueba 2

it('debe tolerar campos opcionales en user (por ejemplo photo ausente)', () => {
  const user = {
    googleId: 'g-456',
    email: 'no-photo@gmail.com',
    name: 'No Photo',
  } as any;

  jwtService.sign.mockReturnValue('another.token');

  const token = service.signToken(user);

  expect(jwtService.sign).toHaveBeenCalledWith({
    sub: 'g-456',
    email: 'no-photo@gmail.com',
    name: 'No Photo',
    photo: undefined,
  });
  expect(token).toBe('another.token');
});
