// 📁 src/modules/account-information/account-information.module.ts

import { Module } from '@nestjs/common';
import { AccountInformationController } from './controllers/account-information.controller';
import { AccountInformationService } from './services/account-information.service';

@Module({
  controllers: [AccountInformationController],
  providers: [AccountInformationService],
  exports: [AccountInformationService],
})
export class AccountInformationModule {}
