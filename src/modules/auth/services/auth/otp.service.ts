// src/common/services/otp.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendSmsOtp(phone: string, otp: string): Promise<void> {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    await this.twilioClient.messages.create({
      body: `  Your RYPM verification code:
${otp}.

This code will expire in 5 minutes.

Don’t share this code with anyone.`,
      from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      to: formattedPhone,
    });
  }



//   async sendEmailOtp(email: string, otp: string): Promise<void> {
//     const transporter = nodemailer.createTransport({
//       host: this.configService.get<string>('SMTP_HOST'),
//       port: +this.configService.get<string>('SMTP_PORT'),
//       secure: false,
//       auth: {
//         user: this.configService.get<string>('SMTP_USER'),
//         pass: this.configService.get<string>('SMTP_PASS'),
//       },
//     });

//     await transporter.sendMail({
//       from: `"RYPM" <${this.configService.get<string>('SMTP_USER')}>`,
//       to: email,
//       subject: 'Your OTP Code',
//       html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
//     });
//   }
}
