import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ConfigModule, // (por claridad, ya es global)
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        console.log('JwtModule factory: JWT_SECRET present?', !!secret); // <-- trazas
        return {
          secret, // SI es undefined, aquí verás 'false'
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRES') || '1h' },
        };
      },
    }),
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
