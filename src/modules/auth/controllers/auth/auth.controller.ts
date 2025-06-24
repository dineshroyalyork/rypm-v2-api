import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { SendOtpDto, sendOtpSchema } from "../../dto/send-otp.dto";
import { VerifyOtpDto,verifyOtpSchema } from "../../dto/verify-otp.dto";
import { AuthService } from "../../services/auth/auth.service";
//import { successResponse } from "@/shared/utils/response";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("send-otp")
  @UsePipes(new ZodValidationPipe(sendOtpSchema))
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const result = await this.authService.sendOtp(sendOtpDto); // Needed to catch error here
      //return successResponse(null, result.message, 201);
      return {
        "statusCode": 201,
        "status": true,
        "message": "OTP has been sent successfully.",
        "data": {}
      }

    } catch (error) {
      return {
        "statusCode": 404,
        "status": false,
        "message": "something went wrong please try again.",
        "data": {}
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(error.message);
    }

    return sendOtpDto;
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(verifyOtpSchema))
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {

    try {
 
      await this.authService.verifyOtp(verifyOtpDto);
      return {
        statusCode: 200,
        status: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      console.error('Error occurred:', error);
      if (error instanceof BadRequestException) {
        return {
          statusCode: 400,
          status: false,
          message: error.message,
        };
      }
      return {
        statusCode: 500,
        status: false,
        message: 'Internal server error',
        error: error.message, // Include the error message
      };
    }
    
  }
}
