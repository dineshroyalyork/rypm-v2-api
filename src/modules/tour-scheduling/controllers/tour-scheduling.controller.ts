import { Controller, Post, Get, Body, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { TourSchedulingService } from '../services/tour-scheduling.service';
import { createTourSlotsSchema, CreateTourSlotsDto } from '../dto/create-tour-slots.dto';
import { getTourSlotsSchema, GetTourSlotsDto } from '../dto/get-tour-slots.dto';

@Controller({ path: 'tour-scheduling', version: '2' })
@UseGuards(AuthGuard)
export class TourSchedulingController {
  constructor(private readonly tourSchedulingService: TourSchedulingService) {}

  @Post('create-slots')
  @UsePipes(new ZodValidationPipe(createTourSlotsSchema))
  async createTourSlots(@Body() createTourSlotsDto: CreateTourSlotsDto) {
    return await this.tourSchedulingService.createTourSlots(createTourSlotsDto);
  }

  @Get('slots')
  @UsePipes(new ZodValidationPipe(getTourSlotsSchema))
  async getTourSlots(@Query() query: GetTourSlotsDto) {
    return await this.tourSchedulingService.getTourSlots(query);
  }

  @Get('available-slots')
  async getAvailableSlots(@Query('property_id') property_id: string, @Query('date') date: string) {
    return await this.tourSchedulingService.getAvailableSlots(property_id, date);
  }
}
