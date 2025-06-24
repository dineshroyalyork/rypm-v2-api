import { BadRequestException, Injectable } from "@nestjs/common";
import { SendOtpDto } from "../../dto/send-otp.dto";
import { VerifyOtpDto } from "../../dto/verify-otp.dto";
import { PrismaService } from "@/shared/prisma/prisma.service";
import { OtpService } from "./otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
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
}






