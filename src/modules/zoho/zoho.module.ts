import { Module } from '@nestjs/common';
import { ZohoService } from './services/zoho/zoho.service';
import { ZohoController } from './controllers/zoho/zoho.controller';

@Module({
  providers: [ZohoService],
  controllers: [ZohoController]
})
export class ZohoModule {}
