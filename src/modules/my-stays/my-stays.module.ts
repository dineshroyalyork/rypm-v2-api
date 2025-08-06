import { Module } from '@nestjs/common';
import { MyStaysController } from './controllers/my-stays.controller';
import { MyStaysService } from './services/my-stays.service';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Module({
  controllers: [MyStaysController],
  providers: [MyStaysService, PrismaService],
  exports: [MyStaysService],
})
export class MyStaysModule {}
