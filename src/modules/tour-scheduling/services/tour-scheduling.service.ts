import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateAvailableDaysDto } from '../dto/create-available-days.dto';
import { GetTourSlotsDto } from '../dto/get-tour-slots.dto';
import { CreateTourScheduledDto } from '../dto/create-tour-scheduled.dto';
import { GetTourScheduledDto } from '../dto/get-tour-scheduled.dto';
import { UpdateTourScheduledDto } from '../dto/update-tour-scheduled.dto';
import { successResponse } from '@/shared/utils/response';
import { WinstonLoggerService } from '@/shared/logger/winston-logger.service';
import { getAvailableTourSlots } from '@/shared/utils/date-utils';

@Injectable()
export class TourSchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: WinstonLoggerService
  ) {}

  async createAvailableDays(createAvailableDaysDto: CreateAvailableDaysDto) {
    try {
      const { property_id, weekday, open_time, close_time } = createAvailableDaysDto;

      const existingSlots = await this.prisma.slots_availabilities.findFirst({
        where: {
          property_id,
          week_day: weekday,
        },
      });

      if (existingSlots) {
        throw new BadRequestException('Tour slots already exist for this property and weekday');
      }

      const slot = await this.prisma.slots_availabilities.create({
        data: {
          property_id,
          week_day: weekday,
          open_time: open_time,
          close_time: close_time,
        },
      });

      return successResponse('Tour slots template created successfully.', slot);
    } catch (error) {
      this.logger.error('Error creating tour slots', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTourSlots(query: GetTourSlotsDto) {
    try {
      const { property_id, days = 4 } = query;

      if (!property_id) {
        throw new BadRequestException('Property ID is required');
      }

      // Get weekday templates for this property
      const weekdayTemplates = await this.prisma.slots_availabilities.findMany({
        where: {
          property_id,
        },
        select: {
          week_day: true,
          open_time: true,
          close_time: true,
        },
      });

      const filteredTemplates = weekdayTemplates.filter(template => template.week_day && template.open_time && template.close_time) as Array<{
        week_day: string;
        open_time: string;
        close_time: string;
      }>;

      const result = getAvailableTourSlots(filteredTemplates, days);

      return successResponse('Tour slots retrieved successfully.', result);
    } catch (error) {
      this.logger.error('Error getting tour slots', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async createTourScheduled(tenant_id: string, createTourScheduledDto: CreateTourScheduledDto) {
    try {
      const { property_id, move_in_date } = createTourScheduledDto;

      if (move_in_date) {
        const startOfSlot = new Date(move_in_date);
        const endOfSlot = new Date(move_in_date);
        endOfSlot.setMinutes(endOfSlot.getMinutes() + 30); // 30-minute slot

        const availableSlot = await this.prisma.tour_scheduled.findFirst({
          where: {
            property_id,
            move_in_date: {
              gte: startOfSlot,
              lt: endOfSlot,
            },
            tenant_id,
          },
        });

        if (availableSlot) {
          throw new BadRequestException('This slot is already booked');
        }
      }

      const tourScheduled = await this.prisma.tour_scheduled.create({
        data: {
          ...createTourScheduledDto,
          tenant_id,
          status: 'PENDING',
        },
      });
      return successResponse('Tour scheduled successfully.', tourScheduled);
    } catch (error) {
      this.logger.error('Error creating tour scheduled', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllTourScheduled(tenant_id: string, query?: GetTourScheduledDto) {
    try {
      const whereClause: any = { tenant_id };
      
      // Add status filter if provided
      if (query?.status) {
        whereClause.status = query.status;
      }

      const tours = await this.prisma.tour_scheduled.findMany({
        where: whereClause,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              thumbnail_image: true,
              latitude: true,
              longitude: true
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return successResponse('Tour scheduled records retrieved successfully.', tours);
    } catch (error) {
      this.logger.error('Error getting tour scheduled records', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTourScheduled(tenant_id: string, updateTourScheduledDto: UpdateTourScheduledDto) {
    try {
      const { id, status, move_in_date } = updateTourScheduledDto;

      // Check if the tour belongs to the tenant
      const existingTour = await this.prisma.tour_scheduled.findFirst({
        where: {
          id,
          tenant_id,
        },
      });

      if (!existingTour) {
        throw new BadRequestException('Tour not found or access denied');
      }

      // Prepare update data
      const updateData: any = {};
      if (status) {
        updateData.status = status;
      }
      if (move_in_date) {
        updateData.move_in_date = new Date(move_in_date);
      }

      // Update the tour
      const updatedTour = await this.prisma.tour_scheduled.update({
        where: { id },
        data: updateData,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              thumbnail_image: true,
              latitude: true,
              longitude: true
            },
          },
        },
      });

      return successResponse('Tour scheduled updated successfully.', updatedTour);
    } catch (error) {
      this.logger.error('Error updating tour scheduled', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
