import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { SendOtpDto, sendOtpSchema } from "../../dto/send-otp.dto";
import { VerifyOtpDto,verifyOtpSchema } from "../../dto/verify-otp.dto";
import { completeOnboardingSchema,CompleteOnboardingDto } from "../../dto/complete-onboarding.dto";
import { AuthService } from "../../services/auth/auth.service";
import { AuthGuard } from "@/shared/guards/auth.guard";
import { updateNotificationsSchema,UpdateNotificationsDto } from "../../dto/toggle-notifications.dto";
import { socialLoginSchema,SocialLoginDto } from "../../dto/social-login.dto";
//import { successResponse } from "@/shared/utils/response";

@Controller({ path: "auth", version: "2" })
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
      console.log(error);
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
 
      const res = await this.authService.verifyOtp(verifyOtpDto);
      return res;
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


  @Post('social-login')
  @UsePipes(new ZodValidationPipe(socialLoginSchema))
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }

  @Post('complete-onboarding')
  @UsePipes(new ZodValidationPipe(completeOnboardingSchema))
  async completeOnboarding(@Body() completeOnboardingDto: CompleteOnboardingDto) {
    return this.authService.completeOnboarding(completeOnboardingDto);
  }

  @UseGuards(AuthGuard)
  @Patch('toggle-notifications')
  @UsePipes(new ZodValidationPipe(updateNotificationsSchema))
  async updateNotifications(
  @Req() req,
  @Body() updateNotificationsDto: UpdateNotificationsDto,
) {
  const tenantId = req.user.sub;
  return this.authService.updateNotificationSetting(tenantId, updateNotificationsDto.notifications_enabled);
}
}
