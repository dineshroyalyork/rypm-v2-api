import { Injectable } from "@nestjs/common";
import { SendOtpDto } from "../../dto/send-otp.dto";
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
}
function generateOtp() {
  throw new Error("Function not implemented.");
}

