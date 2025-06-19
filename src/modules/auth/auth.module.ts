import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { OtpService } from './services/auth/otp.service';
import { AuthController } from './controllers/auth/auth.controller';


@Module({
  providers: [AuthService,OtpService],
  controllers: [AuthController]
})
export class AuthModule {}
