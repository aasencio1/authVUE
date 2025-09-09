// src/auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from './types';
import { AuthService } from './auth.service';

type ReqWithUser = Request & { user?: AuthenticatedUser | undefined };
type ReqWithUserRequired = Request & { user: AuthenticatedUser };

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly isTestEnv = process.env.NODE_ENV === 'test';

  constructor(private readonly auth: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Solo dispara el guard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: ReqWithUser, @Res() res: Response): void {
    const user = req.user;

    if (!user) {
      if (!this.isTestEnv) {
        this.logger.error(
          'Google callback: user is undefined. Revisa logs del guard.',
        );
      }
      res
        .status(401)
        .send({ message: 'Google auth failed. Check server logs.' }); // <-- send en lugar de json
      return;
    }

    const frontend = process.env.FRONTEND_URL;
    if (!frontend) {
      if (!this.isTestEnv) {
        this.logger.error('FRONTEND_URL no está configurada.');
      }
      res.status(500).send({ message: 'Server misconfigured.' }); // <-- send
      return;
    }

    const token = this.auth.signToken(user);
    const redirect = `${frontend}/auth/success#token=${token}`;
    res.redirect(redirect);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: ReqWithUserRequired): { user: AuthenticatedUser } {
    return { user: req.user };
  }
}
