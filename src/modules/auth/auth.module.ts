import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { OtpService } from './services/auth/otp.service';
import { AuthController } from './controllers/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, //jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, OtpService],
  controllers: [AuthController],
})
export class AuthModule {}
