// src/auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from './types';

type ReqWithUser = Request & { user?: AuthenticatedUser };
type ReqWithUserRequired = Request & { user: AuthenticatedUser };

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private auth: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Solo dispara el guard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  /*googleCallback(@Req() req: ReqWithUser, @Res() res: Response): Response {
    const user = req.user;
    if (!user) {
      this.logger.error(
        'Google callback: user is undefined. Revisa logs del guard.',
      );
      return res
        .status(401)
        .send({ message: 'Google auth failed. Check server logs.' });
    }

    const token = this.auth.signToken(user);
    const redirect = `${process.env.FRONTEND_URL}/auth/success#token=${token}`;
    return res.redirect(redirect);
  }*/
  googleCallback(@Req() req: ReqWithUser, @Res() res: Response): void {
    const user = req.user;
    if (!user) {
      this.logger.error(
        'Google callback: user is undefined. Revisa logs del guard.',
      );
      res
        .status(401)
        .send({ message: 'Google auth failed. Check server logs.' });
      return;
    }

    const token = this.auth.signToken(user);
    const redirect = `${process.env.FRONTEND_URL}/auth/success#token=${token}`;

    // ✅ NO devolver el resultado; solo llamar y terminar
    res.redirect(redirect);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: ReqWithUserRequired): { user: AuthenticatedUser } {
    return { user: req.user };
  }
}
