import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { SendOtpDto, sendOtpSchema } from "../../dto/send-otp.dto";
import { AuthService } from "../../services/auth/auth.service";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("send-otp")
  @UsePipes(new ZodValidationPipe(sendOtpSchema))
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      return await this.authService.sendOtp(sendOtpDto); // Needed to catch error here
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }

    return sendOtpDto;
  }
}
