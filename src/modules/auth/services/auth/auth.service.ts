import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SendOtpDto } from "../../dto/send-otp.dto";
import { VerifyOtpDto } from "../../dto/verify-otp.dto";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { CompleteOnboardingDto } from "../../dto/complete-onboarding.dto";
import { JwtService } from '@nestjs/jwt';
import { OtpService } from "./otp.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(payload: SendOtpDto): Promise<{ message: string }> {
    const { type, email, phone_number, country_code } = payload;
    const otp = this.otpService.generateOtp(); // 6-digit OTP
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    const normalizedCountryCode = country_code?.startsWith('+')
    ? country_code
    : `+${country_code}`;
    const identifier =
      type === "email" ? email! : `${normalizedCountryCode!}${phone_number!}`;

    const res = await this.prisma.otp_requests.create({
      data: {
        identifier,
        otp,
        expires_at,
      },
    });

    this.otpService.sendSmsOtp(identifier, otp);

    // console.log(res);
    // if (type === "email") {
    //   await sendOtpViaEmail(email!, otp);
    // } else {
    //   await sendOtpViaSMS(`${country_code}${phone_number}`, otp);
    // }

    return { message: "OTP sent successfully" };
  }

  async verifyOtp(payload: VerifyOtpDto): Promise<{ message: string }> {
    const { type, email, phone_number, country_code, otp } = payload;
  
    // Normalize country code and prepare identifier
    const normalizedCountryCode = country_code?.startsWith('+')
      ? country_code
      : `+${country_code}`;
  
    const identifier =
      type === 'email'
        ? email!
        : `${normalizedCountryCode}${phone_number!}`;
  
    // 1. Fetch latest OTP entry
    const latestOtp = await this.prisma.otp_requests.findFirst({
      where: { identifier },
      orderBy: { created_at: 'desc' },
    });
  
    //console.log(latestOtp);
    // 2. OTP not found
    if (!latestOtp) {
      throw new BadRequestException('No OTP request found for this identifier');
    }
  
    // 3. OTP expired
    if (latestOtp.expires_at < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }
  
    // 4. OTP mismatch
    if (latestOtp.otp !== otp) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }
  
    // 5. OTP already used
    if (latestOtp.verified) {
      throw new BadRequestException('This OTP has already been used.');
    }
  
    // 6. ✅ Mark OTP as verified
    await this.prisma.otp_requests.update({
      where: { id: latestOtp.id },
      data: { verified: true },
    });
  
    return {
      message: 'OTP verified successfully',
    };
  }

  async completeOnboarding(payload: CompleteOnboardingDto) {
    try {
      const { first_name, last_name, email, phone_number, country_code,device_token,platform } = payload;

      const tenant = await this.prisma.tenants.create({
        data: {
          first_name,
          last_name,
          email,
          phone_number,
          country_code,
          is_email_verified: !!email,
          is_phone_verified: !!phone_number
        },
      });

          // Save device token
    await this.prisma.device_tokens.create({
      data: {
        token: device_token,
        platform,
        tenant_id: tenant.id,
      },
    });
    //Generate JWT
      const token = this.jwtService.sign(
        { sub: tenant.id, email: tenant.email },
        { expiresIn: '30d' },
      );

      return {
        statusCode: 201,
        status: true,
        message: 'Onboarding completed successfully.',
        data: {
          access_token: token
        },
      };
    } catch (err) {
      console.error('Onboarding Error:', err);

    if (
      err instanceof PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const target = (err.meta?.target as string[])?.[0];
      if (target === 'email') {
        throw new BadRequestException('Email is already registered.');
      } else if (target === 'phone_number') {
        throw new BadRequestException('Phone number is already registered.');
      } else {
        throw new BadRequestException('Duplicate entry found.');
      }
    }

    if (err instanceof BadRequestException) throw err;

    throw new InternalServerErrorException(
      'Failed to complete onboarding. Try again later.',
    );
    }
  }

  async updateNotificationSetting(tenantId: string, notifications_enabled: boolean) {
  const tenant = await this.prisma.tenants.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new NotFoundException('Tenant not found.');
  }

  const updatedTenant = await this.prisma.tenants.update({
    where: { id: tenantId },
    data: { notifications_enabled },
    select: {
      id: true,
      notifications_enabled: true,
    },
  });

  return {
    statusCode: 200,
    status: true,
    message: `Notifications have been ${notifications_enabled ? 'enabled' : 'disabled'}.`,
    data: {
      notifications_enabled: updatedTenant.notifications_enabled,
    },
  };
}

}






