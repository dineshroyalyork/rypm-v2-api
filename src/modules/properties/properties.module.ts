import { Module } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { BuildingsController } from './controllers/buildings.controller';
import { PropertiesController } from './controllers/properties.controller';
import { BuildingsService } from './services/buildings.service';
import { PropertiesService } from './services/properties.service';
import { PropertyAttachmentsController } from './controllers/property-attachments.controller';
import { PropertyAttachmentsService } from './services/property-attachments.service';

@Module({
  controllers: [PropertiesController, BuildingsController, PropertyAttachmentsController],
  providers: [PropertiesService, BuildingsService, PrismaService, PropertyAttachmentsService],
  exports: [PropertiesService, BuildingsService, PropertyAttachmentsService],
})
export class PropertiesModule {}
