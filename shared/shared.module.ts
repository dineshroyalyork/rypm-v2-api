// 📁 shared/shared.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { APP_FILTER } from '@nestjs/core';
import { APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { AuthGuard } from './guards/auth.guard';

@Global() 
@Module({
  providers: [
    PrismaService,
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
  ],
  exports: [PrismaService],
})
export class SharedModule {}
