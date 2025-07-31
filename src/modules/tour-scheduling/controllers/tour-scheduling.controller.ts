import { Controller, Post, Get, Body, Query, Request, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { TourSchedulingService } from '../services/tour-scheduling.service';
import { CreateAvailableDaysDto, createAvailableDaysSchema } from '../dto/create-available-days.dto';
import { getTourSlotsSchema, GetTourSlotsDto } from '../dto/get-tour-slots.dto';
import { createTourScheduledSchema, CreateTourScheduledDto } from '../dto/create-tour-scheduled.dto';
import { getTourScheduledSchema, GetTourScheduledDto } from '../dto/get-tour-scheduled.dto';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';

@Controller({ path: 'tour-scheduling', version: '2' })
export class TourSchedulingController {
  constructor(private readonly tourSchedulingService: TourSchedulingService) {}

  @Post('available-days')
  @UsePipes(new CustomZodValidationPipe(createAvailableDaysSchema))
  async createAvailableDays(@Body() createAvailableDaysDto: CreateAvailableDaysDto) {
    return await this.tourSchedulingService.createAvailableDays(createAvailableDaysDto);
  }

  @Get('slots')
  @UsePipes(new CustomZodValidationPipe(getTourSlotsSchema))
  async getTourSlots(@Query() query: GetTourSlotsDto) {
    return await this.tourSchedulingService.getTourSlots(query);
  }

  @Post('scheduled')
  @UseGuards(AuthGuard)
  @UsePipes(new CustomZodValidationPipe(createTourScheduledSchema))
  async createTourScheduled(@Request() req: any, @Body() createTourScheduledDto: CreateTourScheduledDto) {
    const tenant_id = req.user?.sub || req.user?.id;
    return await this.tourSchedulingService.createTourScheduled(tenant_id, createTourScheduledDto);
  }
}
