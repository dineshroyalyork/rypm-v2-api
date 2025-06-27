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

  async sendOtpViaSMS(phone: string, otp: string): Promise<void> {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    await this.twilioClient.messages.create({
      body: `  Your RYPM verification code: ${otp}.
      
This code will expire in 5 minutes.

Don’t share this code with anyone.`,
      from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      to: formattedPhone,
    });
  }



 async sendOtpViaEmail(email: string, otp: string): Promise<void> {
    const portStr = this.configService.get<string>('SMTP_PORT');
    const port = portStr ? +portStr : 587; // default SMTP port fallback

    console.log(`email: ${email} otp:${otp}`)

     try {

        const transporter = nodemailer.createTransport({
          host: this.configService.get<string>('SMTP_HOST'),
          port: port,
          secure: false,
          auth: {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          },
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #333;">🔐 Email Verification</h2>
              <p style="font-size: 16px; color: #555;">
                Dear Tenant,
              </p>
              <p style="font-size: 16px; color: #555;">
                Please use the following One-Time Password (OTP) to verify your email address:
              </p>
              <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
              <p style="font-size: 14px; color: #999;">
                ⚠️ This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
              </p>
              <hr style="margin: 20px 0;" />
              <p style="font-size: 12px; color: #aaa;">Regards,<br/>Team RYPM</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"RYPM" <${this.configService.get<string>('SMTP_USER')}>`,
          to: email,
          subject: 'Your OTP Code - RYPM',
          html: htmlContent,
        });

     } catch (err) {
      console.error('Email send failed:', err.message);
      throw new Error('Email service temporarily unavailable. Please try again.');
    }
  }
}
