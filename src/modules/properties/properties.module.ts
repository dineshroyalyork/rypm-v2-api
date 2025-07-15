import { Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BuildingsController } from './controllers/buildings.controller';
import { PropertiesController } from './controllers/properties.controller';
import { BuildingsService } from './services/buildings.service';
import { PropertiesService } from './services/properties.service';

@Module({
  controllers: [PropertiesController, BuildingsController],
  providers: [PropertiesService, BuildingsService, PrismaService],
  exports: [PropertiesService, BuildingsService],
})
export class PropertiesModule {}
