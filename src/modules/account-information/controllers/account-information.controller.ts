import { Controller, Post, Get, Body, UseGuards, Request, UsePipes, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AccountInformationService } from '../services/account-information.service';
import { accountInformationSchema, AccountInformationDto } from '../dto/account-information.dto';
import { InformationType } from '@/shared/enums/account-details.enum';

@Controller({ path: 'account-information', version: '2' })
//@UseGuards(AuthGuard)
export class AccountInformationController {
  constructor(private readonly accountInformationService: AccountInformationService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(accountInformationSchema))
  async createOrUpdateAccountInformation(@Request() req: any, @Body() accountInformationDto: AccountInformationDto) {
    const tenantId = req.user.id;
    const result = await this.accountInformationService.createOrUpdateAccountInformation(tenantId, accountInformationDto);
    return result;
  }

  @Get()
  async getAccountInformation(@Request() req: any, @Query('type') type?: InformationType) {
    const tenantId = req.user.id;
    const result = await this.accountInformationService.getAccountInformation(tenantId, type);
    return result;
  }
}
