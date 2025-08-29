import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'; // 👈 importa el tipo
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        // 👈 tipa retorno
        // Opción A (recomendada, Nest v2): usa getOrThrow
        const secret = config.get<string>('JWT_SECRET'); // o: config.getOrThrow<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not set'); // 👈 garantiza que no sea undefined
        }

        return {
          secret, // ahora es string
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRES') ?? '1h',
          },
        };
      },
    }),
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
