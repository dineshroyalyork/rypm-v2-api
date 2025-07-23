import { Module } from '@nestjs/common';
import { TourSchedulingController } from './controllers/tour-scheduling.controller';
import { TourSchedulingService } from './services/tour-scheduling.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [TourSchedulingController],
  providers: [TourSchedulingService, PrismaService],
  exports: [TourSchedulingService],
})
export class TourSchedulingModule {}
