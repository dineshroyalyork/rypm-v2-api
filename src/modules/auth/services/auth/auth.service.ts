import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SendOtpDto } from '../../dto/send-otp.dto';
import { VerifyOtpDto } from '../../dto/verify-otp.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CompleteOnboardingDto } from '../../dto/complete-onboarding.dto';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { SocialLoginDto } from '../../dto/social-login.dto';
import * as bcrypt from 'bcrypt';
import { CreatePasswordDto } from '../../dto/create-password.dto';
import { LoginWithEmailDto } from '../../dto/login-with-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(payload: SendOtpDto): Promise<{ message: string }> {
    const { type, email, phone_number, country_code, check_exists } = payload;
    const otp = this.otpService.generateOtp(); // 6-digit OTP
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    const normalizedCountryCode = country_code?.startsWith('+')
      ? country_code
      : `+${country_code}`;
    const identifier =
      type === 'email' ? email! : `${normalizedCountryCode!}${phone_number!}`;

    if (check_exists) {
      const whereClause = type === 'email' ? { email } : { phone_number };

      const existingTenant = await this.prisma.tenants.findFirst({
        where: whereClause,
      });

      if (existingTenant) {
        throw new BadRequestException(
          `${type === 'email' ? 'Email' : 'Phone'} is already connected to an account.`,
        );
      }
    }

    const res = await this.prisma.otp_requests.create({
      data: {
        identifier,
        otp,
        expires_at,
      },
    });

    // console.log(res//);
    if (type === 'email') {
      this.otpService.sendOtpViaEmail(identifier, otp);
    } else {
      this.otpService.sendOtpViaSMS(identifier, otp);
    }

    console.log(`otp:${otp} and identifier${identifier}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(payload: VerifyOtpDto): Promise<{
    statusCode: number;
    status: boolean;
    message: string;
    data: {
      access_token: string;
      is_new_tenant: boolean;
    };
  }> {
    const { type, email, phone_number, country_code, otp } = payload;

    const normalizedCountryCode = country_code?.startsWith('+')
      ? country_code
      : `+${country_code}`;

    const identifier =
      type === 'email' ? email! : `${normalizedCountryCode}${phone_number!}`;

    const latestOtp = await this.prisma.otp_requests.findFirst({
      where: { identifier },
      orderBy: { created_at: 'desc' },
    });

    if (!latestOtp) {
      throw new BadRequestException(
        'No OTP request found for this identifier.',
      );
    }

    if (latestOtp.expires_at < new Date()) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    if (latestOtp.verified) {
      throw new BadRequestException('This OTP has already been used.');
    }

    if (latestOtp.otp !== otp) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    await this.prisma.otp_requests.update({
      where: { id: latestOtp.id },
      data: { verified: true },
    });

    const existingTenant = await this.prisma.tenants.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phone_number ? { phone_number } : undefined,
        ].filter(Boolean) as Prisma.tenantsWhereInput[],
      },
    });

    let tenant = existingTenant;
    let isNewUser = false;

    if (!tenant) {
      tenant = await this.prisma.tenants.create({
        data: {
          email: email || '',
          phone_number: phone_number || '',
          country_code: country_code || '',
          first_name: '',
          last_name: '',
          is_email_verified: !!email,
          is_phone_verified: !!phone_number,
        },
      });
      isNewUser = true;
    }

    const token = this.jwtService.sign(
      {
        sub: tenant.id,
        email: tenant.email,
      },
      { expiresIn: '30d' },
    );

    console.log(`isNewUser:${isNewUser}`);
    return {
      statusCode: 200,
      status: true,
      message: 'OTP verified successfully.',
      data: {
        access_token: token,
        is_new_tenant: isNewUser,
      },
    };
  }

  async completeOnboarding(tenantId: string,payload: CompleteOnboardingDto) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone_number,
        country_code,
        device_token,
        platform,
      } = payload;

      const tenant = await this.prisma.tenants.update({
        where: { id: tenantId },
        data: {
          first_name,
          last_name,
          email,
          phone_number,
          country_code,
          is_email_verified: !!email,
          is_phone_verified: !!phone_number,
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
          access_token: token,
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

  async updateNotificationSetting(
    tenantId: string,
    notifications_enabled: boolean,
  ) {
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

  async socialLogin(payload: SocialLoginDto) {
    const { provider, provider_id } = payload;

    try {
      const existingLogin = await this.prisma.login_methods.findFirst({
        where: { provider, provider_id },
        include: { tenant: true },
      });

      if (existingLogin) {
        const token = this.jwtService.sign(
          { sub: existingLogin.tenant.id, email: existingLogin.tenant.email },
          { expiresIn: '30d' },
        );

        return {
          statusCode: 200,
          status: true,
          message: 'Socail Login successful',
          data: {
            access_token: token,
            is_new_tenant: false,
          },
        };
      }

      const newTenant = await this.prisma.tenants.create({
        data: {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          country_code: '',
          password: '',
        },
      });

      await this.prisma.login_methods.create({
        data: {
          provider,
          provider_id,
          tenant_id: newTenant.id,
        },
      });

      const tempToken = this.jwtService.sign(
        { sub: newTenant.id },
        { expiresIn: '30d' },
      );

      return {
        statusCode: 201,
        status: true,
        message: 'New social login, onboarding required',
        data: {
          access_token: tempToken,
          is_new_tenant: true,
        },
      };
    } catch (error) {
      console.error('❌ Social Login Error:', error);
      throw new InternalServerErrorException(
        'Failed to login via social provider',
      );
    }
  }

  async createPassword(tenantId: string, dto: CreatePasswordDto) {
    const { password } = dto;

    // Check if tenant exists
    const tenant = await this.prisma.tenants.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.tenants.update({
      where: { id: tenantId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      statusCode: 200,
      status: true,
      message: 'Password created successfully',
      data: {},
    };
  }

  // auth.service.ts
  async loginWithEmailPassword(payload: LoginWithEmailDto) {
    const { email, password } = payload;

    const tenant = await this.prisma.tenants.findUnique({
      where: { email },
    });

    if (!tenant || !tenant.password) {
      throw new BadRequestException({
        statusCode: 400,
        status: false,
        message: 'This email and password combination is incorrect.',
        data: {},
      });
    }

    const isPasswordValid = await bcrypt.compare(password, tenant.password);

    if (!isPasswordValid) {
      throw new BadRequestException({
        statusCode: 400,
        status: false,
        message: 'This email and password combination is incorrect.',
        data: {},
      });
    }

    if (!tenant.is_email_verified) {
      await this.prisma.tenants.update({
        where: { id: tenant.id },
        data: { is_email_verified: true },
      });
    }

    const token = this.jwtService.sign(
      { sub: tenant.id, email: tenant.email },
      { expiresIn: '30d' },
    );

    return {
      statusCode: 200,
      status: true,
      message: 'Logged in successfully',
      data: {
        access_token: token,
      },
    };
  }
}
