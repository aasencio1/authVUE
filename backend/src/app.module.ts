import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

/*@Module({ 
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService],
})*/

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'], // busca en backend/
      //   envFilePath: '.env',
    }), // lee .env
    AuthModule,
  ],
})
export class AppModule {}
