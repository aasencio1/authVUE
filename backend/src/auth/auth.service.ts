import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  signToken(user: any) {
    // En real: buscar/crear usuario en DB y firmar con su id
    const payload = {
      sub: user.googleId,
      email: user.email,
      name: user.name,
      photo: user.photo,
    };
    return this.jwt.sign(payload);
  }
}
