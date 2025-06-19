import { Body, Controller, Post } from "@nestjs/common";

@Controller({ path: "tenants", version: "1" })
export class TenantsController {
  @Post("send-otp")
  sendOtp(@Body() body) {
    console.log(body);
    //return this.tenantsService.sendOtp(body);
  }
}
