import { Module } from '@nestjs/common';
import { PropertiesController } from './controllers/properties.controller';
import { PropertiesService } from './services/properties.service';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, PrismaService],
})
export class PropertiesModule {}
