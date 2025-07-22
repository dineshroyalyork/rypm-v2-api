import { Controller, Post, Get, Body, UseGuards, Request, UsePipes, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { AccountInformationService } from '../services/account-information.service';
import { accountInformationSchema, AccountInformationDto } from '../dto/account-information.dto';
import { InformationType } from '@/shared/enums/account-details.enum';

@Controller({ path: 'account-information', version: '2' })
@UseGuards(AuthGuard)
export class AccountInformationController {
  constructor(private readonly accountInformationService: AccountInformationService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(accountInformationSchema))
  async createOrUpdateAccountInformation(@Request() req: any, @Body() accountInformationDto: AccountInformationDto) {
    const tenant_id = (req as any).user?.sub || (req as any).user?.id;
    const result = await this.accountInformationService.createOrUpdateAccountInformation(tenant_id, accountInformationDto);
    return result;
  }

  @Get()
  async getAccountInformation(@Request() req: any, @Query('type') type?: InformationType) {
    try {
      const tenant_id = (req as any).user?.sub || (req as any).user?.id;
      const result = await this.accountInformationService.getAccountInformation(tenant_id, type);

      return {
        success: true,
        message: type ? `${type.replace('_', ' ')} retrieved successfully` : 'All account information retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}
