import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')

export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('google')
  // @UseGuards(AuthGuard('google'))
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Solo dispara el guard, no hace await
  }


  @Get('google/callback')

  // @UseGuards(AuthGuard('google'))
  
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response) {
    //const user = (req as any).user;
    const user = req.user;
    if (!user) {
      // Si USAS GoogleAuthGuard, en consola verás info/err con la causa (redirect_uri_mismatch, invalid_client, etc.)
      console.error('Google callback: user is undefined. Revisa logs previos del guard.');
      return res.status(401).send({ message: 'Google auth failed. Check server logs.' });
    }

    const token = this.auth.signToken(user);
    const redirect = `${process.env.FRONTEND_URL}/auth/success#token=${token}`;
    return res.redirect(redirect);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
   me(@Req() req: Request) {
    return { user: (req as any).user };
  }
}
